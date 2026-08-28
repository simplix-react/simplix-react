# DTO 메타데이터 기반 코드 생성

백엔드가 DTO 구조·검증·검색·권한을 중간 표현(IR)으로 제공하고, `@simplix-react/cli`가 그 IR로
타입·zod 스키마·요청 함수·훅·mock·필터 설정을 생성한다. 기존 OpenAPI + orval 경로는 그대로
동작하며, 두 경로는 도메인 패키지 안에서 나란히 생성되고 배럴이 어느 쪽을 내보낼지 고른다.

## 1 · 해결하는 문제

OpenAPI 문서는 Java DTO의 정보를 일부만 담는다. springdoc이 스키마를 만들면서 상속을 평면화하고
제약 애노테이션 일부를 버리기 때문에, OpenAPI를 아무리 정확히 읽어도 복원할 수 없다.

| 잃는 정보 | 결과 |
| --- | --- |
| 클래스 상속 | `UpdateDTO extends CreateDTO`가 필드를 복사한 평면 인터페이스 둘이 된다 |
| `@Length(max)` · `@NotBlank`의 최소 길이 | 클라이언트가 빈 문자열과 초과 길이를 통과시킨다 |
| 응답 봉투(envelope)의 단일 정의 | 오퍼레이션마다 같은 6필드 타입을 따로 만든다 |
| `@SearchableField` 연산자·정렬 | 필터 종류와 정렬 가능 컬럼을 사람이 다시 정한다 |
| `@PreAuthorize` 권한 | 버튼 노출 조건을 프론트엔드에 손으로 적는다 |
| 라벨 붙은 열거형의 전송 모양 | 타입은 `"AREA" \| "ZONE"`인데 실제 값은 `{ value, label }` 객체다 |
| 시각의 종류 | `Instant` · `LocalDate` · `LocalTime`이 모두 `string`이 된다 |
| 컨트롤러가 아는 엔티티와 역할 | 경로 모양과 DTO 접미사로 되짚어야 한다 |

메타데이터 경로는 이 여덟 가지를 서버의 애노테이션과 메서드 시그니처에서 직접 읽어 생성물에
반영한다.

라벨 붙은 열거형은 특히 조용하다. 타입이 문자열 유니언이라 `row.status === "REVOKED"`가 컴파일을
통과하고 언제나 거짓이 된다 — 실제 값이 `{ value: "REVOKED", label: "회수됨" }`이기 때문이다.

## 2 · 저장소별 산출물

| 저장소 | 산출물 |
| --- | --- |
| `simplix` (백엔드 프레임워크) | 메타 엔드포인트, IR 직렬화, `SimpliXMetaContributor` SPI, `FieldLabel` 애노테이션, 메시지 리졸버·`LabeledEnum` 가족·i18n dev 엔드포인트 이관 |
| `accesscore-smart-safety/smart-safety-backend` | `FieldLabel`·`LabeledEnum`·리졸버 import 교체와 앱 사본 삭제, `common-dev`의 i18n 구현 삭제, `.simplix/templates/dto` 템플릿 갱신 |
| `simplix-generator` | 견본 DTO 템플릿의 `FieldLabel` import 교체, `@Schema(requiredMode)` 규약 반영 |
| `simplix-react` | `packages/cli/src/meta/` 생성기, 병렬 생성, 배럴 전환, `meta-diff` 명령, scaffold 필드 소스 확장, `simplix-boot-utils`의 `LabeledEnumValue<T>` |

`accesscore-pacs-studio`는 변경하지 않는다. 프레임워크의 메타 기능은 속성으로 켜야 동작하고,
`FieldLabel`은 프레임워크에 새로 추가되므로 앱이 자기 사본을 그대로 써도 영향받지 않는다.

## 3 · 백엔드 메타 엔드포인트

`spring-boot-starter-simplix`가 `SimpliXMetaAutoConfiguration`으로
`GET /api/v1/dev/meta/dto`를 등록한다. 지금 앱의 `common-dev` 모듈에 있는
`/api/v1/dev/i18n/messages`도 §7에서 프레임워크로 올라오므로, **두 dev 엔드포인트가 같은
자동 구성 아래 나란히 선다** — CLI 플러그인이 전제하던 i18n 경로 규약이 앱의 관례에서
프레임워크의 보증으로 바뀐다. 앱의 보안 설정이 개발 프로파일에서 `/api/v1/dev/**`를 허용하는
기존 규칙이 그대로 두 경로를 덮는다.

- `simplix.dev.meta.enabled=true`일 때만 등록한다. 기본값은 꺼짐이고 운영 프로파일에서는 켜도
  등록하지 않는다. 보안 태세는 i18n 개발 엔드포인트와 같다 — 개발 프로파일에서 인증 없이
  허용하고, CLI의 내려받기도 인증을 보내지 않는다.
- DTO 수집은 `DtoSchemaAutoRegistrar`와 같은 방식이다 — `RequestMappingHandlerMapping`으로
  핸들러를 훑고 `ResolvableType`으로 요청·응답 타입에서 도달 가능한 클래스를 모은다.
- 구조·상속·제네릭은 리플렉션과 `ResolvableType`에서 읽는다.
- 직렬화 결과는 Jackson에게 묻되, **앱의 `ObjectMapper` 빈에게 묻는다** — `new ObjectMapper()`가
  아니라 Boot이 구성한 그 빈의 `getSerializationConfig().introspect(type)`이 주는
  `BeanDescription`이 정본이다. 프로퍼티 이름 전략과 날짜 직렬화가 매퍼 설정에 달려 있어서다 —
  `boolean isMultiOccupancy` 필드의 전송 이름이 `isMultiOccupancy`인지 `multiOccupancy`인지는
  빈 이름 규칙과 매퍼 설정만이 안다. `@JsonIgnore`, `@JsonProperty` 이름 변경,
  `@JsonFormat`, 커스텀 시리얼라이저가 이 목록에 이미 반영되어 있다.
- 두 결과를 합쳐 IR을 만든다. 리플렉션에는 있으나 Jackson 프로퍼티 목록에 없는 필드는
  직렬화되지 않으므로 IR에서 제외한다.
- `@SearchableField`는 별도 라이브러리(searchable-jpa)의 애노테이션이므로 클래스 이름으로
  선택적으로 읽는다 — 그 라이브러리를 쓰지 않는 앱에서도 메타 엔드포인트가 동작해야 한다.

## 4 · IR 명세

```ts
interface DtoMeta {
  version: 1;
  enums: Record<string, EnumMeta>;
  types: Record<string, TypeMeta>;
  operations: OperationMeta[];
  extensions?: Record<string, unknown>;
}

interface EnumMeta {
  /** SimpliXLabeledEnum 구현체는 true — 값이 { value, label } 객체로 직렬화된다 */
  labeled: boolean;
  values: { name: string; labelKey?: string }[];
}

interface TypeMeta {
  javaClass: string;
  /** 상위 타입 이름. 필드는 자기 것만 싣는다 */
  extends: string | null;
  /** 타입 파라미터 이름. 제네릭 DTO가 없으면 빈 배열이다 */
  typeParams: string[];
  description?: string;
  fields: FieldMeta[];
}

interface FieldMeta {
  /** 직렬화되는 이름. @JsonProperty가 있으면 그 값이다 */
  name: string;
  type: TypeRef;
  required: boolean;
  nullable: boolean;
  description?: string;
  /** @FieldLabel의 메시지 키 모드 — {entities.X.y}에서 추출한 키 */
  labelKey?: string;
  /** @FieldLabel의 직접 라벨 모드 — 키가 아닌 문자열 그대로 */
  label?: string;
  constraints: Constraint[];
  searchable?: {
    operators: string[];
    sortable: boolean;
    entityField?: string;
    sortField?: string;
  };
}

type TypeRef =
  | { kind: "string" | "boolean" | "unknown" }
  | { kind: "number"; integral: boolean }
  | { kind: "instant" }                       // Instant · OffsetDateTime
  | { kind: "date" }                          // LocalDate
  | { kind: "time"; pattern?: string }        // LocalTime + @JsonFormat(pattern)
  | { kind: "enum"; name: string }
  | { kind: "ref"; name: string; args?: TypeRef[] }
  | { kind: "param"; name: string }                     // 타입 파라미터 참조
  | { kind: "container"; name: string; args: TypeRef[] } // Page · List · Map · 응답 봉투
  | { kind: "file" }                                     // MultipartFile — TS File · zod z.instanceof(File)
  | { kind: "binary" }                                   // Resource · byte[] 응답 — Blob을 주는 내려받기 함수
  | { kind: "pick"; of: string; fields: string[] };      // @JsonIncludeProperties

interface OperationMeta {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  tag: string;
  summary?: string;
  request: {
    /** 컨테이너를 감싼 그대로 싣는다. 다중 수정은 `Set<XUpdateDTO>`, 재정렬은 `List<XOrderDTO>`라
     *  이름만 실으면 원소 타입이 사라진다 */
    body?: TypeRef;
    contentType?: "json" | "multipart";
    query: ParamMeta[];
    path: ParamMeta[];
    /** 검색 파라미터의 원본 DTO. @SearchableParams(X.class)와 SearchCondition<X> 양쪽에서 뽑는다 */
    searchDto?: string;
  };
  /** 컨테이너를 감싼 그대로 싣는다. null = Void */
  response: TypeRef | null;
  access: AccessMeta;
}

/** @PreAuthorize를 구조로 푼 것. 표현식 문자열을 프론트엔드가 파싱하지 않게 한다 */
type AccessMeta =
  | { kind: "permission"; group: string; action: string }  // hasPermission('SYSTEM', 'edit')
  | { kind: "authenticated" }                              // isAuthenticated()
  | { kind: "public" }                                     // permitAll()
  | { kind: "expression"; raw: string };                   // 그 밖의 SpEL — 원문 그대로
```

`extends`와 자기 필드만 싣는 규칙이 상속을 그대로 보존한다.

`id`와 `tag`는 springdoc이 내던 값과 같아야 한다 — 기존 `domains` 태그 매핑과 훅 이름
규칙(`simplixBootNaming`)이 그 값 위에 서 있다. `id`는 `OperationIdCustomizer`와 같은
클래스 + 메서드 유도(`AdminUserRole_get`)를 재사용하고, `tag`는 컨트롤러의 `@Tag(name)`에서
읽는다.

검색 오퍼레이션은 두 모양으로 온다 — `@SearchableParams(XSearchDTO.class)`가 평탄화한 쿼리
매개변수(`name.contains=…`)와 `@RequestBody SearchCondition<XSearchDTO>`. 어느 쪽이든 매개변수
이름만으로는 필터를 생성할 수 없으므로, IR이 `request.searchDto`로 원본 DTO를 가리키고 필터
생성기는 그 DTO의 `searchable`을 읽는다.

`Page<SiteListDTO>`를 반환하는 오퍼레이션의 `response`는 다음과 같다.

```json
{ "kind": "container", "name": "SimpliXApiResponse",
  "args": [{ "kind": "container", "name": "Page",
             "args": [{ "kind": "ref", "name": "SiteListDTO" }] }] }
```

### IR JSON에서 무엇이 항상 오는가

생성기가 「없는 것」과 「비어 있는 것」을 가르려면 이 세 줄이 필요하다. 직렬화기는 모든 레코드에
`@JsonInclude(NON_NULL)`을 걸지만, 그 설정이 지우는 것은 `null`뿐이다.

| 자리 | 전송 결과 |
| --- | --- |
| 원시 타입 필드(`required` · `nullable` · `sortable` · `labeled` · `version`) | 값과 무관하게 **항상 온다** — `false`도 `0`도 그대로 실린다 |
| `null`인 참조 타입(문자열 · 객체 · 배열 · 맵) | 키째로 **사라진다**. `"key": null`은 나오지 않는다 |
| 비어 있는 배열·맵 | **사라지지 않는다** — `"typeParams": []` · `"query": []`로 온다 |

`TypeRef.integral`만 박싱 타입(`Boolean`)이라 예외다. `number`가 아닌 종류에서는 키째로 사라진다.

## 4.1 · 상위 패키지가 제공하는 컨테이너 타입

`Page` · `List` · `Map` · 응답 봉투는 도메인에 속하지 않는 공용 구조다. 도메인 패키지가 이것을
다시 선언하면 도메인 수만큼 같은 타입이 생기므로, 생성기는 **선언하지 않고 가져다 쓴다.**

`@simplix-react-ext/simplix-boot-auth`가 이미 내보내는 것을 그대로 쓴다.

| 쓰임 | 이미 있는 것 |
| --- | --- |
| 페이지 타입 | `SpringPage<T>` |
| 페이지 스키마 | `pageOf(itemSchema)` · `springPageSchema` |
| 응답 봉투 타입 | `BootEnvelope<T>` |
| 응답 봉투 스키마 | `envelopeSchema(bodySchema)` · mock 생성에 쓰는 `wrapEnvelope` |

`@simplix-react-ext/simplix-boot-utils`에는 라벨 붙은 열거형의 타입이 없다. `resolveBootEnum`
옆에 다음을 더한다.

```ts
export interface LabeledEnumValue<T extends string> {
  value: T;
  label: string;
}
```

**이름을 TypeScript로 옮기는 규칙은 CLI 플러그인이 갖는다.** 백엔드는 컨테이너의 Java 이름만
말하고, 그 이름을 어떤 타입·스키마·import로 쓸지는 프로파일이 정한다. 백엔드가 나중에 다른
컨테이너를 쓰더라도 IR 명세는 그대로이고 매핑 한 줄만 는다.

```ts
// simplix-boot CLI 플러그인
containerTypes: {
  SimpliXApiResponse: { unwrap: true },   // mutator가 벗기므로 클라이언트 타입에 나타나지 않는다
  Page: {
    ts: "SpringPage",
    zod: "pageOf",
    import: "@simplix-react-ext/simplix-boot-auth",
  },
  List: { ts: "Array", zod: "z.array" },
  Map: { ts: "Record", zod: "z.record", keyType: "string" },
}
```

`unwrap: true`가 봉투를 클라이언트 타입에서 없앤다 — `src/mutator.ts`가 이미 벗기므로 React
Query의 `data`는 본문이다. 봉투 스키마는 mock 핸들러에서만 쓴다.

## 5 · 검증 애노테이션 대응

| Java | zod |
| --- | --- |
| `@NotNull` | 필수 필드 — 타입에 `?`를 붙이지 않는다 |
| `@NotBlank` | `.trim().min(1)` |
| `@NotEmpty` | `.min(1)` — 문자열과 배열 |
| `@Size(min,max)` · `@Length(max)` | `.min()` · `.max()` |
| `@Min` · `@Max` · `@DecimalMin` · `@DecimalMax` | `.min()` · `.max()` — **값 타입이 갈린다**, 아래 |
| `@Positive` · `@PositiveOrZero` · `@Negative` · `@NegativeOrZero` | `.positive()` · `.nonnegative()` · `.negative()` · `.nonpositive()` |
| `@Pattern(regexp)` | `.regex()` |
| `@Email` | `.email()` |
| `@AssertTrue` · `@AssertFalse` | `z.literal(true)` · `z.literal(false)` |
| `@Valid` | 중첩 타입의 스키마 참조 |
| 그 밖의 커스텀 제약 | IR에 `{ kind: "custom", name }`으로 싣고 zod에서는 생략한다. 생성물 주석에 서버 전용 검증임을 남긴다 |
| 반복 제약 컨테이너 (`@Pattern.List`) | 같은 `custom`으로 싣는다 — 아래 |

**`min`·`max`의 값은 숫자일 수도 문자열일 수도 있다.** `@Min`·`@Max`는 `long`을 돌려주어 JSON
숫자로 오고(`{"kind":"min","value":-1}`), `@DecimalMin`·`@DecimalMax`는 `String`을 돌려주어 JSON
문자열로 온다(`{"kind":"min","value":"1.5"}`). 두 경우의 `kind`가 같고 `ConstraintMeta`에 값 타입을
구분하는 항목이 없으므로, zod 생성기는 `value`의 JSON 타입을 실행 시점에 판정해 숫자로 변환한다.
문자열을 그대로 `.min()`에 넘기면 zod가 거절한다.

**제약은 조용히 사라지지 않는다.** 반복 가능한 제약을 한 필드에 여럿 붙이면 리플렉션이 그 여럿을
컨테이너 애노테이션 하나로 노출하므로, 개별 제약을 찾는 코드는 아무것도 보지 못한다. 그대로 두면
검증 규칙이 흔적 없이 없어지는데, 이 엔드포인트가 없애려는 결함이 바로 그런 침묵이다. 컨테이너를
알아보는 판정은 「`value()`가 배열을 돌려주고 그 원소 타입에 `@Constraint`가 붙어 있는가」이고,
걸린 것은 `custom`으로 실어 사람이 보게 한다.

## 5.1 · 생성물 요건

생성기가 지켜야 하는 것이다. 각 항목은 IR이 실어 오는 정보로 기계가 판정한다.

| 요건 | 근거 |
| --- | --- |
| 모든 생성 파일이 타입 검사를 받는다 — `@ts-nocheck`를 붙이지 않는다 | 검사에서 빠진 코드는 틀려도 빌드가 통과한다 |
| 라벨 붙은 열거형은 `LabeledEnumValue<T>`로 낸다 | 원시 문자열과 비교하면 컴파일이 실패해야 한다 |
| 컨테이너는 상위 패키지에서 가져다 쓴다 | §4.1 |
| 필터의 연산자는 IR의 `searchable.operators`에서 온다 | 값 모양을 보고 연산자를 추측하지 않는다 |
| IR 연산자 이름을 프론트엔드 `SearchOperator`로 옮기는 표를 두고, 열거형 전체를 빠짐없이 덮는다 | 두 이름이 늘 같지는 않다 — IR의 `GREATER_THAN_OR_EQUAL_TO`는 열거형 키 `GREATER_THAN_OR_EQUAL`에 해당한다. 이름으로 바로 찾으면 `undefined`가 조용히 나온다 |
| 시각 필드는 `instant` · `date` · `time` 종류를 구분해 낸다 | 세 가지가 서로 다른 입력 컴포넌트를 쓴다 |
| 필수 여부는 선언에서만 온다 — 필드 이름으로 추론하지 않는다 | §12의 필수 판정 근거 둘 |
| `expression` 권한은 게이트를 생성하지 않고 사람이 정하도록 남긴다 | 아래 |
| dev 엔드포인트는 컴포넌트 스캔 범위 밖에 두거나 스캔에서 제외한다 | 아래 |
| 순환 참조 타입의 zod는 `z.lazy()`로 낸다 | interface는 순환을 허용하지만 zod 상수는 선언 순서에 묶인다 |
| CLI는 자기가 아는 것보다 새 IR `version`을 거절한다 | 모르는 필드를 조용히 버리면 생성물이 조용히 얕아진다 |
| 쿼리 키의 첫 요소는 요청 URL 문자열이고, 목록 키는 params 객체를 함께 싣는다 | `useInvalidateEntity`가 `queryKey[0]`의 URL 접두사로 무효화한다 — 키 모양이 다르면 오류 없이 무효화만 멎어 화면이 낡은 데이터를 보여 준다 |
| 응답 봉투는 이름으로 판정한다 | 필드 모양으로 봉투를 알아보면 본문이 빈 응답을 놓친다 |
| 같은 타입을 두 번 선언하지 않는다 | 중복을 지우는 후처리가 필요 없어야 한다 |

### 게이트는 등록 경로가 하나일 때만 게이트다

`SimpliXAutoConfiguration`이 `dev.simplecore.simplix.web`를 무조건 컴포넌트 스캔한다. 그 안에
`@RestController`를 둔 컨트롤러는 속성 게이트와 무관하게 빈으로 등록되고, 의존성은 게이트된
자동 구성에만 있으므로 컨텍스트가 뜨지 못한다. **게이트가 무력화되는 데 그치지 않고 앱이 아예
부팅되지 않는다** — 운영 프로파일에서 속성을 켜도 마찬가지다. 운영 거부 조건이 서비스만 막고
스캔은 그대로 컨트롤러를 만들기 때문이다.

**그리고 슬라이스 테스트는 이것을 잡지 못한다.** 게이트 클래스만 로드하는 테스트에는 스캔이
관여하지 않아, 결함이 살아 있는 채로 초록이 나온다. 그래서 **우산 자동 구성을 로드한 채 속성
없이 컨텍스트가 뜨는지 확인하는 테스트**가 게이트마다 필요하다. 없으면 같은 실수가 다시 들어온다.

## 6 · 확장점

애플리케이션이 자기 애노테이션을 IR에 더할 수 있어야 한다. 프레임워크는 앱의 애노테이션을 알지
못하므로 SPI로 받는다.

```java
public interface SimpliXMetaContributor {
    default void contributeType(TypeMetaBuilder builder, Class<?> type) {}
    default void contributeField(FieldMetaBuilder builder, Field field) {}
    default void contributeOperation(OperationMetaBuilder builder, HandlerMethod method) {}
}
```

프레임워크가 `ObjectProvider<List<SimpliXMetaContributor>>`로 구현체를 수집한다. 앱은 `@Component`
하나를 등록해 IR의 `extensions`에 자기 데이터를 넣는다.

프론트엔드도 짝이 되는 확장점을 갖는다. `SpecProfile`에 다음을 더한다.

```ts
interface SpecProfile {
  // 기존 필드는 그대로 둔다
  metaEndpoint?: string;
  metaDownloader?: (serverOrigin: string) => Promise<DtoMeta | undefined>;
  metaExtensions?: (meta: DtoMeta) => MetaExtensionOutput | undefined;
}

/** `metaExtensions`가 내는 것. 백엔드 기여자가 `extensions`에 넣은 데이터를 프로파일이 파일로 옮긴다 */
interface MetaExtensionOutput {
  /** `generated-meta/` 기준 상대 경로 → 파일 내용. 기존 생성 파일 경로와 겹치면 오류로 멈춘다 */
  files: Record<string, string>;
}
```

`@simplix-react-ext/simplix-boot-cli-plugin`이 `simplix-boot` 프로파일에 이 셋을 등록한다.
`simplix-boot` 프로파일은 지금 기여자를 쓰지 않으므로 `metaExtensions`를 등록하지 않는다 —
확장점은 열려 있고 기본 동작은 없다.

## 7 · 앱 자산의 프레임워크 이관

메타 파이프라인이 기대는 것 가운데 앱 영역에 있던 범용 자산을 프레임워크로 올린다. 네 가지이고,
전부 앱 의존성이 없거나 설정으로 대체된다.

| 이관물 | 지금 위치 | 프레임워크에서 |
| --- | --- | --- |
| `FieldLabel` 애노테이션 | `app-core` | `simplix-core`의 애노테이션 |
| 메시지 리졸버 (`AbstractMessageResolver` · `EntityMessageResolver` · `EnumMessageResolver`) | `domain-core` | classpath 패턴 스캔이라 그대로 옮긴다 |
| `LabeledEnum` 가족 (인터페이스 · `LabeledEnumDeserializer`) | `domain-core` | 프레임워크의 표준 라벨 열거형이 된다 |
| i18n dev 엔드포인트 (컨트롤러 · 서비스 · DTO) | `common-dev` | 메타 엔드포인트와 같은 자동 구성 아래 |

**`LabeledEnum` 이관이 전송 계약을 통일한다.** 프레임워크의 `SimpliXLabeledEnum`은
`{ name, label }`로 직렬화되는데, 앱의 `LabeledEnum`은 `@JsonProperty("value")`를 더해
`{ value, label }`을 만들고 `resolveBootEnum`과 이 설계 전체가 그 모양을 전제한다. 이관하면서
`value` 모양을 프레임워크가 보증하게 한다.

**i18n 서비스의 앱 결합은 패키지 스캔 기준점 하나다** — 열거형을 찾을 때 앱의
`DomainBasePackage` 마커를 쓴다. 프레임워크 판은 마커 대신 속성(`simplix.dev.base-packages`,
비우면 자동 구성 패키지)으로 받는다.

`FieldLabel` 이관 절차는 다음이다. 앱 의존성이 없는 값 하나짜리 애노테이션이라 IR이 라벨 키를
실을 수 있게 하는 전제다.

1. `simplix-core`에 `dev.simplecore.simplix.core.annotation.FieldLabel`을 추가한다.
2. smart-safety의 `@FieldLabel` 사용처 2,161곳의 import를 교체한다.
3. `GlobalExceptionHandler`는 애플리케이션에 그대로 두고 import 한 줄만 바꾼다.
4. **백엔드 제너레이터 템플릿의 import도 교체한다** — smart-safety의
   `.simplix/templates/dto/EntityDTOs.java.template`(82행이 앱 사본을 import한다)과
   `simplix-generator`의 견본 템플릿. 빼먹으면 다음 `yo simplix` 실행이 삭제된 클래스를
   import하는 DTO를 낸다. 같은 템플릿에 §12의 `@Schema(requiredMode = REQUIRED)` 규약을
   함께 넣어, 새로 생성되는 응답 DTO가 필수 판정 규약을 처음부터 따르게 한다.
5. `dev.accesscore.app.infra.annotation.FieldLabel`을 삭제한다.

`LabeledEnum` 가족과 i18n 엔드포인트도 같은 모양으로 간다 — 프레임워크에 추가, smart-safety의
import 교체(`LabeledEnum` 140곳 · `EntityMessageResolver` 38곳 · `EnumMessageResolver` 13곳),
`common-dev`의 i18n 컨트롤러·서비스·DTO와 `domain-core`의 사본 삭제. 제너레이터 템플릿은
`LabeledEnum`을 참조하지 않으므로 추가 수정이 없다.

별칭이나 `@Deprecated`는 두지 않는다. 애노테이션이 없는 필드는 IR의 `labelKey`가 비고, 생성기는
필드 이름을 그대로 쓴다.

## 8 · CLI 파이프라인

`packages/cli/src/meta/`를 새로 만든다. 기존 `packages/cli/src/openapi/`는 변경하지 않는다.

```
meta/
  fetch.ts             엔드포인트 또는 스냅샷 파일에서 IR을 읽는다
  ir-types.ts          IR 타입 정의
  resolve.ts           상속 해석, 타입 참조 정리, 도메인 분할
  generation/
    model-gen.ts       interface + extends
    schema-gen.ts      zod + .extend()
    endpoint-gen.ts    요청 함수
    hook-gen.ts        React Query 훅
    mock-gen.ts        MSW 핸들러와 시드
    search-gen.ts      @SearchableField → 필터·정렬 설정
    access-gen.ts      AccessMeta → useCan 게이트용 화면 키·동작 상수
```

도메인 분할은 기존과 같은 규칙을 쓴다 — `simplix.config.ts`의 `domains`가 태그 패턴으로 나누고,
IR의 `operations[].tag`가 그 패턴에 걸린다.

기존 `openapi` 명령은 코드 외의 부속물도 만든다. 메타 경로가 같은 부속물을 만들지 않으면 도메인을
옮기는 순간 스캐폴드와 검증 명령이 깨지므로, 같은 것을 만들되 생성 모듈을 공유한다.

| 부속물 | 처리 |
| --- | --- |
| 로케일 JSON (`src/locales/*.json`) | IR의 `labelKey` · `label`로 만든다. 서버 i18n 내려받기는 그대로 |
| CRUD 설정 (`crud.config.ts`) | 오퍼레이션의 역할 추론 대신 IR의 오퍼레이션 목록으로 만든다 |
| `.http` 파일 | IR의 오퍼레이션에서 만든다 — 생성 모듈 재사용 |
| `constants.ts` · `translations.ts` | 지금 모듈 재사용 |
| mock 시드 (`src/mock/seeds.ts`) | 재생성 사이에 보존 — 기존 규칙 그대로 |

두 경로가 공유하는 것이 셋 있다. 새로 만들지 않고 그대로 쓴다.

| 공유물 | 규칙 |
| --- | --- |
| `src/mutator.ts` | 메타 쪽 요청 함수도 `getMutator("boot")`를 거친다. 응답 봉투를 한 곳에서만 벗겨야 두 경로의 `data`가 같은 모양이다 |
| `src/locales/*.json` | IR의 `labelKey`가 있으면 그 키를 쓰고, 없으면 지금처럼 필드 이름에서 만든다. 서버 i18n 내려받기(`i18nDownloader`)는 그대로 둔다 |
| `src/mock/seeds.ts` | 재생성 사이에 보존한다. 메타 쪽 핸들러도 같은 시드를 읽는다 |

## 9 · 생성물 레이아웃

```
packages/domain-<name>/src/
  generated/                    orval 산출물 — 변경하지 않는다
  generated-meta/
    model/<entity>.ts           Create · Update · Detail · List 인터페이스
    model/_enums.ts             이 도메인 열거형의 별칭과 값 목록
    schema/<entity>.ts          zod 스키마 — 상수 이름은 orval 이름(XRestCreateBody)을 따르고 상속은 .extend()
    endpoints/<entity>.ts       요청 함수
    hooks/<entity>.ts           React Query 훅
    search/<entity>.ts          필터·정렬 설정
    access/<entity>.ts          권한 상수
    mock/handlers.ts
    index.ts
  index.ts                      어느 쪽을 내보낼지 고르는 배럴
```

파일 수는 엔티티당 6개에 도메인당 공용 3개다.

라벨 붙은 열거형은 방향에 따라 타입이 다르다 — **서버는 `{ value, label }` 객체로 보내고,
클라이언트는 `"AREA"` 같은 값 문자열로 보낸다**(`LabeledEnumDeserializer`가 문자열을 받는다).
응답과 요청에 같은 타입을 쓰면 어느 한쪽이 반드시 틀린다.

```ts
// model/_enums.ts
import type { LabeledEnumValue } from "@simplix-react-ext/simplix-boot-utils";

/** 요청 DTO 필드와 비교 코드가 쓰는 값 유니언. orval이 내던 상수 맵과 이름·모양이 같다 */
export type AreaKind = (typeof AreaKind)[keyof typeof AreaKind];
export const AreaKind = { AREA: "AREA", ZONE: "ZONE" } as const;

/** 응답 DTO 필드의 실제 전송 모양 */
export type AreaKindLabeled = LabeledEnumValue<AreaKind>;
```

생성 규칙: **요청 DTO의 열거형 필드는 값 유니언, 응답 DTO의 열거형 필드는 `LabeledEnumValue`다.**
상수 맵은 orval이 내던 것과 이름이 같으므로, `SiteOnboardingStepKey`처럼 모듈이 값으로 import하는
자리가 그대로 동작한다.

## 9.1 · CLI 스캐폴딩과의 접점

`simplix scaffold`가 만드는 위젯·페이지가 메타 도메인 위에서도 나와야 한다. 접점은 둘로 갈리고,
성격이 다르다.

**템플릿은 공용이다 — 새 템플릿을 만들지 않는다.** `templates/ui/*.hbs`와
`templates/native/*.hbs`의 import를 전수 확인한 결과, 전부 패키지 배럴(`{{packageName}}`)과
프레임워크 패키지에서 이름으로 가져오며 `generated/` 경로 참조와 zod 스키마 참조가 0건이다.
§11의 공개 이름 동일성이 지켜지면 템플릿 산출물은 메타 도메인에서 고치지 않고 동작한다.
예외는 하나 — `templates/openapi/user-index-ts.hbs`가 `export * from "./generated/model"`을
고정으로 갖는다. 재수출 경로를 템플릿 변수로 빼서 한 템플릿이 양쪽을 섬기게 한다.

**입력층은 orval 출력의 텍스트 모양에 묶여 있다 — 여기가 이원화 대상이다.**

| 자리 | 지금의 전제 | 메타 경로에서 깨지는 방식 |
| --- | --- | --- |
| `findSchemaFile` | `X…Body = zod.object(` 정규식 | `.extend()`로 선언한 Update 스키마가 매칭에서 빠진다 — 상속 필드가 폼에서 조용히 사라진다 |
| `parseSchemaFields` | 인라인 `zod.object({...})` 본문 텍스트 파싱 | 상속받은 필드가 보이지 않는다 |
| `readListDtoFieldNames` | `src/generated/model/<파일>.ts` 경로, 파일당 인터페이스 하나 | 메타는 `generated-meta/model/<entity>.ts`에 여러 인터페이스를 둔다 |
| `parseFilterParams` | 스냅샷 queryParams의 `field.operator` 접미사를 파싱해 연산자를 추측 | IR이 `searchable.operators`를 직접 싣는다 — 추측이 필요 없다 |
| 스냅샷 fallback | orval이 갱신하는 `.openapi-snapshot.json` | 도메인이 메타로 넘어가면 갱신이 멎어 낡은 채 읽힌다 |

고치는 방법은 필드 소스의 이원화다. 스캐폴드의 데이터 계약(`FieldInfo` · `FilterFieldInfo` ·
`EntityOperations`)은 그대로 두고, 그 값을 채우는 소스를 둘 둔다.

- **IR 소스**(`meta/scaffold-source.ts`) — 도메인에 메타 산출물이 있으면 IR에서 직접 채운다.
  필수 여부는 선언에서, 필터 연산자는 `searchable.operators`에서, 라벨은 `labelKey`에서 온다.
- **기존 소스** — orval 도메인은 지금의 zod 텍스트 파싱 그대로. 변경하지 않는다.

두 소스가 같은 계약을 채우므로 템플릿과 렌더링 코드는 하나다. IR 소스에서는 연산자 추측이
사라지므로, 필터 설계 뒤 백엔드 DTO를 사람이 확인하던 절차가 생성 시점에 자동으로 끝난다.

## 10 · 공존과 전환

```ts
// simplix.config.ts
openapi: [{
  spec: "http://localhost:8082/api-docs/all-apis",
  profile: "simplix-boot",
  meta: {
    source: "http://localhost:8082/api/v1/dev/meta/dto",
    snapshot: "openapi/meta.json",   // 선택 — 지정하면 받은 IR을 여기 쓴다
    export: ["site"],                // 배럴이 메타 산출물을 내보내는 도메인
  },
  domains: { site: ["site.*"], worker: ["worker.*"] },
}]
```

`meta`가 있으면 두 벌을 생성하고, `export`에 든 도메인만 메타 쪽을 내보낸다. 내보내는 층은
`index.ts` 하나가 아니라 재수출 층 전체다 — `index.ts` · `hooks/<entity>.ts` · `hooks/index.ts` ·
`schemas.ts` · `mock/index.ts` · `mock/seeds.ts` 여섯 자리가 함께 메타 산출물을 가리켜야 한다.
`mock/seeds.ts`도 `../generated/model`을 import하므로 여기 든다.

앞의 셋은 보존할 내용이 없어 다시 생성하고, `schemas.ts` · `mock/index.ts` · `mock/seeds.ts`는
손편집 내용을 보존하며 `../generated/` 상대 import 줄만 바꾼다.

**두 산출물의 분할 기준이 다르므로 경로 치환으로는 바꿀 수 없다.** orval은 태그마다 파일 하나에
요청 함수와 훅을 함께 담고(`generated/endpoints/<tag-slug>/<tag-slug>.ts`), 메타 산출물은 엔티티마다
`endpoints/`와 `hooks/` 둘로 나눈다(§9). 엔티티 분할은 경로 기준이라 태그 하나가 엔티티 여럿을 낼 수
있다. 그래서 `generated-meta/`가 `endpoints/index.ts`와 `hooks/index.ts` 배럴을 함께 내고, 재수출
층은 그 배럴을 가리키도록 다시 생성한다.

도메인 하나를 옮기는 절차는 다음과 같다.

1. `meta.source`를 설정하고 `simplix openapi`를 실행해 두 벌을 생성한다.
2. `simplix meta-diff <domain>`을 0건까지 맞춘다.
3. `export`에 도메인 이름을 더해 배럴을 교체한다.
4. 타입체크·빌드를 통과시키고 화면을 브라우저로 확인한다.
5. 안정된 뒤 그 도메인의 `generated/`를 제거한다.

되돌리기는 `export` 목록에서 도메인을 빼는 것이다 — 재수출 층이 orval 산출물로 돌아간다. 그래서
`generated/` 제거(5단계)는 되돌아갈 일이 없다고 판단한 뒤의 마지막 단계다.

`export`에 들지 않은 도메인은 이전 산출물을 그대로 내보내므로, 아직 옮기지 않은 도메인과 그
도메인을 참조하는 모듈 코드는 고치지 않아도 동작한다.

## 11 · 대조 검증

`simplix meta-diff <domain>`이 두 산출물이 내보내는 타입을 대조해 보고한다. **대조하는 두 벌은
같은 실행에서 같은 서버로 생성한 것이어야 한다** — 서로 다른 시점에 만든 두 벌을 대조하면 그
사이 백엔드가 움직인 만큼이 어느 생성기의 잘못도 아닌 차이로 나온다.

배럴 교체가 드롭인이려면 모듈 코드가 import하는 공개 이름 — 훅, DTO 타입, 열거형 상수 맵,
params 타입, zod 스키마, mock 핸들러 팩토리(`createXHandlers`) — 가 전부 같아야 한다. 그래서 메타 훅 생성기는 프로파일의 이름
규칙(`simplixBootNaming`)을 그대로 쓰고, 이름 차이는 경고가 아니라 오류다.

| 검사 | 보고 수준 |
| --- | --- |
| 한쪽에만 있는 공개 이름 (타입 · 훅 · 상수 맵 · params · 스키마) | 오류 |
| 한쪽에만 있는 필드 | 오류 |
| 필드 타입 불일치 | 오류 |
| 필수 여부 차이 — 아래 「의도된 차이」에 들지 않는 것 | 오류 |
| 오퍼레이션 누락 | 오류 |
| 메타 쪽에만 있는 제약 | 정보 — OpenAPI가 잃은 것이므로 정상이다 |

**의도된 차이는 정보로 분류한다.** 메타 경로가 고치려고 만든 차이가 오류로 나오면 진짜 표류가 그
소음에 묻힌다. 셋이 여기 해당한다 — 응답 열거형 필드가 값 유니언에서 `LabeledEnumValue`로 바뀐
것, 원시 타입·`@Schema` 근거로 필수가 된 필드, 요청 스키마에 늘어난 제약.

## 12 · 확정된 판단

smart-safety 코드에서 확인한 사실과 그에 따른 결정이다.

**Jackson 규칙** — `@JsonView`는 쓰지 않는다(0곳). `@JsonIgnore`는 DTO 안에 64곳 있고 Jackson의
프로퍼티 목록이 이미 제외하므로 별도 처리가 없다. `@JsonIncludeProperties`와
`@JsonManagedReference`는 전부 엔티티에 있고 **DTO 필드에 엔티티 타입이 오는 곳이 없다**. IR에
`pick` 표현은 두되 이번 적용에서는 쓰이지 않는다.

**제네릭** — 사용자 정의 제네릭 DTO가 없다(`TypeMeta.typeParams`는 전부 빈 배열이다). 응답
컨테이너는 `SimpliXApiResponse`, `Page`(93곳), `List`(83곳), `Map`(16곳) 넷이고 `Slice`는 쓰지
않는다(0곳). IR은 이것을 `container`로 감싼 그대로 싣고, TypeScript 이름은 플러그인의
`containerTypes`가 정한다.

**커스텀 검증기** — 앱이 만든 `ConstraintValidator` 구현체는 없지만, **프레임워크가 제공하는
제약은 쓰인다** — `@Unique` 64곳, `@ValidateWith` 1곳. 전부 DB를 읽어야 판정되는 서버 전용
검사라 zod로 옮길 수 없고 옮겨서도 안 된다. IR에 `{ kind: "custom", name }`으로 싣고 생성기는
주석으로 서버 전용임을 남긴다.

**`@I18nTrans` 97곳** — 직렬화 시점에 로케일을 골라 넣는 프레임워크 Jackson 애노테이션이다.
붙은 String 필드는 이미 번역된 값으로 오므로 IR에서는 평범한 문자열이고, 짝이 되는
`xxxI18n` Map 필드는 Jackson 가시성을 그대로 따른다(요청 DTO에서는 `map` 컨테이너로 실려
다국어 편집 폼이 된다). 별도 IR 종류가 필요 없고, 스캐폴드의 i18n 필드 짝 감지는 필드
이름으로 동작하므로 IR 소스에서도 그대로 성립한다.

**Spring Boot 버전** — 프레임워크가 Boot 3.5.x · jakarta 단일이다. javax 이중 지원이 없으므로
메타 모듈은 jakarta만 상대한다.

**타입 이름은 단순명이고, 겹치면 IR이 한쪽을 잃는다** — `types`가 이름을 키로 쓰는 맵이라
서로 다른 두 DTO가 같은 단순명을 내면 나중 것이 앞엣것을 덮어쓴다. 패키지를 나눠도 해결되지
않는다 — 이름을 만드는 규칙이 `getSimpleName()`이고, 그 메서드는 정의상 패키지를 버린다.
smart-safety에 실제로 한 건 있다(DTO 선언 633개, 고유 단순명 632개). 열거형은 139개가 모두
고유하다.

**엔드포인트는 호출될 때 실패한다.** 레지스트리가 충돌을 발견하면 두 클래스의 완전 수식명을 담은
예외를 던진다. 틀린 IR이 나가는 경로가 사라지고, 개발자는 개명해야 할 두 클래스를 바로 본다.
이름을 자동으로 수식하지는 않는다 — 632개를 짧게 유지하고 §11의 공개 이름 동일성을 지키기
위해서다. 겹친 쪽은 서버에서 개명한다.

**`LocalDateTime`은 지금 `instant`로 합쳐진다** — 대상 앱에 DTO·엔티티 모두 0곳이라 지금은
문제가 없다. 다만 `LocalDateTime`은 시간대가 없는 벽시계 날짜·시각이라 진짜 순간과 다르고,
합쳐 두면 프론트엔드가 시간대 변환을 걸어 값이 조용히 어긋난다 — 이 설계가 없애려는 결함과
같은 부류다. **`LocalDateTime` 필드가 생기면 `instant`로 흡수하지 말고 종류를 하나 더
만든다**(벽시계 날짜·시각). 매퍼의 해당 분기에 이 판단을 주석으로 남긴다.

**`Slice`는 `Page`와 같은 이름으로 온다** — `Slice`도 대상 앱에 0곳이다. 둘이 같은 컨테이너
이름을 쓰면 하류에서 구별할 수 없는데, `Page`는 `totalElements`를 싣고 `Slice`는 `hasNext`만
싣는다. `Slice`를 쓰는 오퍼레이션이 생기면 전체 건수를 가진 척하는 타입이 나오므로, 그때
컨테이너 이름을 나눈다.

**트리 엔드포인트** — `GET /tree`가 `SimpliXApiResponse<AreaTreeDTO>`를 반환하는 일반
오퍼레이션이다. 전용 컨테이너가 없고, 재귀 DTO는 §5.1의 `z.lazy()` 요건이 덮는다.

**`FieldLabel` 이관 범위** — 프레임워크에 추가하고 smart-safety만 옮긴다. pacs-studio는 자기
사본을 그대로 쓴다.

**서버 없는 재생성** — smart-safety는 이미 살아 있는 서버 주소로 생성한다. 메타 경로도 같은
전제를 따르고, `meta.snapshot`은 선택이다. 지정하면 `--offline`으로 서버 없이 재생성한다.

**열거형 표현** — `LabeledEnum`이 `@JsonProperty("value")`와 `@JsonFormat(shape = OBJECT)`를
쓰므로 응답 값은 `{ value, label }`로 오고, 역직렬화기는 값 문자열을 받는다. 138개 열거형이 모두
이 모양이라 §9의 방향별 타입 규칙이 전부에 적용되고, §7의 이관 뒤에는 이 전송 모양이 앱의
관례가 아니라 프레임워크의 계약이다.

**`expression`으로 남는 15곳** — `hasAuthority`·`hasRole` 3곳과 `and`·`or`가 든 복합 표현식
12곳은 구조로 풀리지 않아 `expression`으로 온다. 이중 따옴표는 0곳이라 문제가 없고,
단일 따옴표 604곳은 전부 `permission`으로 풀린다.

**생성기는 `expression`을 「권한 없음」으로 읽지 않는다.** 그렇게 읽으면 그 15곳의 버튼이
조용히 사라진다. 게이트를 생성하지 않고 생성물 주석에 원문을 남겨, 그 화면을 짜는 사람이
조건을 손으로 정하게 한다. 목록은 `meta-diff`가 보고한다.

**권한 표현식의 모양** — 723곳이 `hasPermission('그룹', '동작')` · `isAuthenticated()` ·
`permitAll()` 셋으로 끝난다. `hasAuthority`는 쓰지 않고 클래스 수준 `@PreAuthorize`도 없다.
`AccessMeta`의 `permission`이 프론트엔드의 `useCan("<동작>", SUBJECTS.<키>)`와 그대로
대응하므로, 파싱되지 않는 SpEL은 `expression`으로 원문을 실어 프론트엔드가 「권한 없음」으로
잘못 읽지 않게 한다.

**검증 그룹** — `groups =`를 쓰는 제약이 0곳이다. IR은 그룹을 싣지 않고, 생기면 판올림한다.

**`simplix-boot-utils` 의존성** — `_enums.ts`가 `LabeledEnumValue`를 import하므로 프로파일의
`dependencies`에 `@simplix-react-ext/simplix-boot-utils`를 더한다. 지금은 `simplix-boot-auth`
하나만 있다.

**multipart와 바이너리** — `MultipartFile` 필드가 16곳, `Resource`·`byte[]` 응답이 9곳 있다.
파일 필드는 `{ kind: "file" }`로 실어 TS `File`과 `z.instanceof(File)`로 내고, 바이너리 응답은
`{ kind: "binary" }`로 실어 React Query 훅 대신 `Blob`을 주는 내려받기 함수를 낸다. SSE와 WebSocket은 0곳이라
이번 범위에 없다 — 뒤에 생기면 IR에 종류를 더한다.

**시각 필드** — `@JsonFormat(pattern = "HH:mm")`이 붙은 `LocalTime`은 IR의 `time` 종류로 싣고,
생성기가 `string` + `.regex(/^\d{2}:\d{2}$/)`로 낸다.

**응답 DTO의 필수 여부** — 요청 DTO는 `@NotNull` · `@NotBlank`가 판정한다. 응답 DTO에는 그런
선언이 없으므로 근거를 둘 쓴다.

1. **Java 원시 타입**(`int` · `long` · `boolean` · `double`)은 자동으로 필수다. null이 될 수 없는
   타입이므로 추가 선언 없이 확실하다.
2. **`@Schema(requiredMode = REQUIRED)`**를 응답 DTO 필드에 적으면 필수로 싣는다. 서버가 반드시
   채우는 기본 키·감사 필드가 여기 해당한다.

둘 중 아무것도 없으면 선택이다. 규약을 추론해 필수로 올리지 않는다 — 규약이 깨진 DTO 하나가
조용히 틀린 타입을 만든다.

## 13 · 구현 순서

의존 순서다. 각 단계를 저장소 전체에 펼치기 전에, smart-safety의 작은 도메인 하나로 1~11을
끝까지 통과시키는 세로 절단을 먼저 한다 — 사양 검토가 못 보는 문제는 구현에서만 드러나므로,
그 문제를 가장 싼 지점에서 만난다.

1. 프레임워크에 `FieldLabel` · 메시지 리졸버 · `LabeledEnum` 가족을 추가하고 IR 타입과
   직렬화기를 만든다.
2. 메타 엔드포인트 · i18n dev 엔드포인트와 `SimpliXMetaContributor` SPI를 등록한다.
3. smart-safety의 import를 교체하고(`FieldLabel` 2,161곳 · `LabeledEnum` 140곳 · 리졸버 51곳)
   백엔드 제너레이터 템플릿을 갱신한 뒤, 앱 사본과 `common-dev`의 i18n 구현을 삭제한다.
4. CLI에 `meta/fetch.ts`와 `ir-types.ts`를 만들어 IR을 받아 오고, 받은 IR 표본을 픽스처로
   커밋해 이후 생성기들의 골든 테스트 기반으로 쓴다.
5. 모델과 zod 생성기를 만든다.
6. 요청 함수와 훅 생성기를 만든다.
7. 검색·권한·mock 생성기를 만든다.
8. 병렬 생성과 배럴 전환을 `simplix.config.ts`에 연결한다.
9. scaffold의 필드 소스를 IR로 넓히고 `user-index-ts.hbs`의 재수출 경로를 변수로 뺀다.
10. `meta-diff` 명령을 만든다.
11. smart-safety의 도메인을 하나씩 옮기고, 옮긴 도메인에서 `simplix scaffold`를 실행해
    위젯이 같은 모양으로 나오는지 확인한다.
