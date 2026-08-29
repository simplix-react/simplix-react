# DTO Meta Endpoint — Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The SimpliX framework serves `GET /api/v1/dev/meta/dto` returning SimpliX Meta (structure, inheritance, jakarta validation, `@SearchableField`, `@PreAuthorize`, labels, enums), and smart-safety serves it live with its app-level assets (FieldLabel, message resolvers, LabeledEnum family, i18n dev endpoint) migrated into the framework.

**Architecture:** A new `web/meta` package in `spring-boot-starter-simplix` builds SimpliX Meta by walking `RequestMappingHandlerMapping` handler methods (like the existing `DtoSchemaAutoRegistrar`), reading serialization truth from the application's `ObjectMapper` bean and declaration truth (constraints, labels, searchable, access) from reflection. App-generic assets move from smart-safety into `simplix-core`. Everything is gated behind `simplix.dev.meta.enabled` and never registers under a production profile.

**Tech Stack:** Java 17 (records), Spring Boot 3.5.7, springdoc conventions already in the starter, JUnit 5 + Mockito + AssertJ (existing starter test style).

**Spec:** `docs/design/2026-08-28-dto-meta-codegen.md` (Korean). This plan implements spec §13 steps 1–3 plus the SimpliX Meta capture that unblocks the frontend plan.

**Repositories:**

| Alias | Path |
| --- | --- |
| FRAMEWORK | `/Users/taehwan/Workspace/simplix/simplix` |
| APP | `/Users/taehwan/Workspace/accesscore/accesscore-smart-safety/smart-safety-backend` (⚠ its git root is the PARENT `accesscore-smart-safety`, shared with the frontend) |
| FRONTEND | `/Users/taehwan/Workspace/accesscore/accesscore-smart-safety/smart-safety-frontend` |

**Pinned facts (verified):**
- APP pins the framework at `simplix = "1.2.5-SNAPSHOT"` in `gradle/libs.versions.toml` and has `mavenLocal()` in `settings.gradle` → `publishToMavenLocal` is consumed directly.
- `SimpliXApiResponse.success(body)` is the success factory (`simplix-core/src/main/java/dev/simplecore/simplix/core/model/SimpliXApiResponse.java:45`).
- Auto-configurations register in `spring-boot-starter-simplix/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`.
- `@SearchableParams` lives at `dev.simplecore.searchable.openapi.annotation.SearchableParams`; `@SearchableField` at `dev.simplecore.searchable.core.annotation.SearchableField`. searchable-jpa may be absent on a consumer's classpath → read both **by class name reflectively**.
- The app's OperationIdCustomizer convention: `AdminUserRoleController.get()` → `AdminUserRole_get` (strip `Controller`/`RestController` suffix).
- Framework Java level: 17 (records allowed). Build with `JAVA_HOME` already configured for gradle.
- Commit messages: English conventional commits, **no AI attribution of any kind**.
- **APP's git repository root is `accesscore-smart-safety`, holding BOTH `smart-safety-backend`
  and `smart-safety-frontend`.** A bare `git add -A` there sweeps unrelated frontend changes into
  a backend commit — always stage explicit backend paths and read `git diff --cached --stat`
  before committing.
- FRAMEWORK and `simplix-generator` are on branch `feat/dto-meta-endpoint`. Do not switch branches there.
- **APP is on `main` and ANOTHER Claude session (`accesscore-smart-safety-db`) is actively editing
  it right now.** Its working tree is shared, so `git checkout -b` there moves that session's HEAD
  too — it already happened once and cost them a stray commit plus a cherry-pick to recover.
  **Never create, switch, or delete a branch in APP.** Commit onto whatever branch is checked out,
  staging only the exact paths the task changed.

**Working agreements for every task:**
- Run framework tests from FRAMEWORK root: `./gradlew :spring-boot-starter-simplix:test --tests '<pattern>'`.
- Never edit generated/build output. Never commit unless the task's commit step says so.
- Where a step says "copy from APP", the source file is authoritative — copy, then apply ONLY the listed transforms.

---

### Task 1: `FieldLabel` annotation in simplix-core

**Files:**
- Create: `FRAMEWORK/simplix-core/src/main/java/dev/simplecore/simplix/core/annotation/FieldLabel.java`
- Test: `FRAMEWORK/simplix-core/src/test/java/dev/simplecore/simplix/core/annotation/FieldLabelTest.java`

- [ ] **Step 1: Write the failing test**

```java
package dev.simplecore.simplix.core.annotation;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;

class FieldLabelTest {

    static class Sample {
        @FieldLabel("{entities.Sample.name}")
        String name;

        @FieldLabel("Plain Label")
        String title;
    }

    @Test
    void isReadableAtRuntimeOnFields() throws Exception {
        Field name = Sample.class.getDeclaredField("name");
        FieldLabel label = name.getAnnotation(FieldLabel.class);
        assertThat(label).isNotNull();
        assertThat(label.value()).isEqualTo("{entities.Sample.name}");

        Field title = Sample.class.getDeclaredField("title");
        assertThat(title.getAnnotation(FieldLabel.class).value()).isEqualTo("Plain Label");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd FRAMEWORK && ./gradlew :simplix-core:test --tests 'dev.simplecore.simplix.core.annotation.FieldLabelTest'`
Expected: compile FAILURE — `FieldLabel` does not exist.

- [ ] **Step 3: Write the annotation**

Copy the javadoc and member from `APP/packages/app-core/src/main/java/dev/accesscore/app/infra/annotation/FieldLabel.java`, changing only the package line:

```java
package dev.simplecore.simplix.core.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Specifies a human-readable label for a DTO field.
 *
 * <p>Two modes:
 * <ol>
 *   <li><b>Message key mode</b>: {@code {message.key}} syntax, resolved from message bundles</li>
 *   <li><b>Direct label mode</b>: plain text used as-is</li>
 * </ol>
 *
 * <p>Consumed by validation error enhancement and by the dev meta endpoint
 * (message-key mode becomes {@code labelKey}, direct mode becomes {@code label} in SimpliX Meta).
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface FieldLabel {

    /** Label text, either a {@code {message.key}} or a direct label. */
    String value();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd FRAMEWORK && ./gradlew :simplix-core:test --tests 'dev.simplecore.simplix.core.annotation.FieldLabelTest'`
Expected: PASS

- [ ] **Step 5: Commit (FRAMEWORK repo)**

```bash
cd FRAMEWORK
git add simplix-core/src/main/java/dev/simplecore/simplix/core/annotation/FieldLabel.java \
        simplix-core/src/test/java/dev/simplecore/simplix/core/annotation/FieldLabelTest.java
git commit -m "feat(core): add FieldLabel annotation for DTO field labels"
```

---

### Task 2: Message resolvers migrate into simplix-core

**Files:**
- Create (copied): `FRAMEWORK/simplix-core/src/main/java/dev/simplecore/simplix/core/i18n/AbstractMessageResolver.java`
- Create (copied): `FRAMEWORK/simplix-core/src/main/java/dev/simplecore/simplix/core/i18n/EntityMessageResolver.java`
- Create (copied): `FRAMEWORK/simplix-core/src/main/java/dev/simplecore/simplix/core/i18n/EnumMessageResolver.java`
- Test: `FRAMEWORK/simplix-core/src/test/java/dev/simplecore/simplix/core/i18n/EnumMessageResolverTest.java`
- Test fixture: `FRAMEWORK/simplix-core/src/test/resources/messages/enums/test-messages.properties` and `test-messages_ko.properties`

Source of truth to copy from:
- `APP/packages/domain-core/src/main/java/dev/accesscore/domain/core/util/AbstractMessageResolver.java`
- `APP/packages/domain-core/src/main/java/dev/accesscore/domain/core/util/EntityMessageResolver.java`
- `APP/packages/domain-core/src/main/java/dev/accesscore/domain/core/util/EnumMessageResolver.java`

- [ ] **Step 1: Copy the three files and repackage**

```bash
cd FRAMEWORK
mkdir -p simplix-core/src/main/java/dev/simplecore/simplix/core/i18n
for f in AbstractMessageResolver EntityMessageResolver EnumMessageResolver; do
  cp "/Users/taehwan/Workspace/accesscore/accesscore-smart-safety/smart-safety-backend/packages/domain-core/src/main/java/dev/accesscore/domain/core/util/$f.java" \
     "simplix-core/src/main/java/dev/simplecore/simplix/core/i18n/$f.java"
done
perl -pi -e 's/^package dev\.accesscore\.domain\.core\.util;/package dev.simplecore.simplix.core.i18n;/' \
  simplix-core/src/main/java/dev/simplecore/simplix/core/i18n/*.java
```

Then open each copied file and remove any remaining `import dev.accesscore.*` lines. If one exists, the class it names must either (a) already have a framework equivalent — import that instead — or (b) be reported in the task result as a blocker. Do not copy additional app classes silently.

- [ ] **Step 2: Write the failing test**

```java
package dev.simplecore.simplix.core.i18n;

import org.junit.jupiter.api.Test;

import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;

class EnumMessageResolverTest {

    @Test
    void resolvesFromClasspathBundlesPerLocale() {
        String ko = EnumMessageResolver.resolveMessage("enums.TestKind.ACTIVE", Locale.KOREAN);
        String en = EnumMessageResolver.resolveMessage("enums.TestKind.ACTIVE", Locale.ENGLISH);
        assertThat(ko).isEqualTo("활성");
        assertThat(en).isEqualTo("Active");
    }

    @Test
    void fallsBackToKeyWhenMissing() {
        String missing = EnumMessageResolver.resolveMessage("enums.TestKind.NOPE", Locale.ENGLISH);
        // AbstractMessageResolver's documented fallback: adjust the assertion to the copied
        // implementation's actual fallback (key or last key segment) after reading it.
        assertThat(missing).isNotNull();
    }
}
```

Fixture `src/test/resources/messages/enums/test-messages.properties`:

```properties
enums.TestKind.ACTIVE=Active
```

Fixture `src/test/resources/messages/enums/test-messages_ko.properties`:

```properties
enums.TestKind.ACTIVE=활성
```

Before running, read the copied `AbstractMessageResolver` and `EnumMessageResolver` for the actual static API (`resolveMessage(key, locale)` was observed in the app's `LabeledEnum.getLabel`). If the signature differs, fix the TEST to the real API — the implementation is authoritative, this is a migration.

- [ ] **Step 3: Run the test**

Run: `cd FRAMEWORK && ./gradlew :simplix-core:test --tests 'dev.simplecore.simplix.core.i18n.EnumMessageResolverTest'`
Expected: PASS (the copied implementation already works; the test pins the migrated behavior). If it fails on classpath scanning, check that the copied class scans `classpath*:messages/enums/**/*-messages.properties` and that the fixture name matches `*-messages.properties`.

- [ ] **Step 4: Commit (FRAMEWORK repo)**

```bash
cd FRAMEWORK
git add simplix-core/src/main/java/dev/simplecore/simplix/core/i18n \
        simplix-core/src/test/java/dev/simplecore/simplix/core/i18n \
        simplix-core/src/test/resources/messages
git commit -m "feat(core): add classpath-scanned entity/enum message resolvers"
```

---

### Task 3: `LabeledEnum` family in simplix-core (the `{value,label}` wire contract)

**Files:**
- Create: `FRAMEWORK/simplix-core/src/main/java/dev/simplecore/simplix/core/enums/LabeledEnum.java`
- Create (copied): `FRAMEWORK/simplix-core/src/main/java/dev/simplecore/simplix/core/enums/LabeledEnumDeserializer.java`
- Test: `FRAMEWORK/simplix-core/src/test/java/dev/simplecore/simplix/core/enums/LabeledEnumSerdeTest.java`

Source to copy: `APP/packages/domain-core/src/main/java/dev/accesscore/domain/core/enums/LabeledEnumDeserializer.java`.

- [ ] **Step 1: Write the failing test**

```java
package dev.simplecore.simplix.core.enums;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LabeledEnumSerdeTest {

    enum TestKind implements LabeledEnum {
        ACTIVE, RETIRED
    }

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void serializesAsValueLabelObject() throws Exception {
        String json = mapper.writeValueAsString(TestKind.ACTIVE);
        // value comes from name(); label resolves via EnumMessageResolver (falls back without bundles)
        assertThat(json).contains("\"value\":\"ACTIVE\"");
        assertThat(json).contains("\"label\":");
    }

    @Test
    void deserializesFromBareValueString() throws Exception {
        TestKind kind = mapper.readValue("\"RETIRED\"", TestKind.class);
        assertThat(kind).isEqualTo(TestKind.RETIRED);
    }

    @Test
    void deserializesFromValueLabelObject() throws Exception {
        TestKind kind = mapper.readValue("{\"value\":\"ACTIVE\",\"label\":\"whatever\"}", TestKind.class);
        assertThat(kind).isEqualTo(TestKind.ACTIVE);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd FRAMEWORK && ./gradlew :simplix-core:test --tests 'dev.simplecore.simplix.core.enums.LabeledEnumSerdeTest'`
Expected: compile FAILURE — `LabeledEnum` does not exist.

- [ ] **Step 3: Write `LabeledEnum` and copy the deserializer**

`LabeledEnum.java` — mirror the app interface (`APP/packages/domain-core/src/main/java/dev/accesscore/domain/core/enums/LabeledEnum.java`) with framework imports:

```java
package dev.simplecore.simplix.core.enums;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import dev.simplecore.simplix.core.i18n.EnumMessageResolver;
import org.springframework.context.i18n.LocaleContextHolder;

import java.util.Locale;

/**
 * Labeled enum with the {@code {value,label}} wire contract.
 *
 * <p>Serializes as {@code {"value": name(), "label": localized}} and deserializes from either
 * the bare value string or the full object. The label resolves from
 * {@code classpath*:messages/enums/**} bundles via {@link EnumMessageResolver} using the key
 * {@code enums.<SimpleClassName>.<NAME>}.
 */
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
@JsonDeserialize(using = LabeledEnumDeserializer.class)
public interface LabeledEnum extends SimpliXLabeledEnum {

    @JsonProperty("value")
    String name();

    default String getLabel() {
        return getLabel(LocaleContextHolder.getLocale());
    }

    default String getLabel(Locale locale) {
        String key = String.format("enums.%s.%s", this.getClass().getSimpleName(), this.name());
        return EnumMessageResolver.resolveMessage(key, locale);
    }
}
```

Copy the deserializer and repackage:

```bash
cd FRAMEWORK
cp "/Users/taehwan/Workspace/accesscore/accesscore-smart-safety/smart-safety-backend/packages/domain-core/src/main/java/dev/accesscore/domain/core/enums/LabeledEnumDeserializer.java" \
   simplix-core/src/main/java/dev/simplecore/simplix/core/enums/LabeledEnumDeserializer.java
perl -pi -e 's/^package dev\.accesscore\.domain\.core\.enums;/package dev.simplecore.simplix.core.enums;/' \
  simplix-core/src/main/java/dev/simplecore/simplix/core/enums/LabeledEnumDeserializer.java
```

Remove any `import dev.accesscore.*` lines from the copied deserializer (its `LabeledEnum` reference now resolves in-package). If `EnumMessageResolver.resolveMessage`'s real signature differs from the call above, match the interface to the real one.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd FRAMEWORK && ./gradlew :simplix-core:test --tests 'dev.simplecore.simplix.core.enums.LabeledEnumSerdeTest'`
Expected: PASS

- [ ] **Step 5: Commit (FRAMEWORK repo)**

```bash
cd FRAMEWORK
git add simplix-core/src/main/java/dev/simplecore/simplix/core/enums \
        simplix-core/src/test/java/dev/simplecore/simplix/core/enums
git commit -m "feat(core): add LabeledEnum with value/label wire contract"
```

---

### Task 4: SimpliX Meta model records (starter `web/meta/model`)

**Files:**
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/model/TypeRef.java`
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/model/ConstraintMeta.java`
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/model/SearchableMeta.java`
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/model/FieldMeta.java`
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/model/TypeMeta.java`
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/model/EnumMeta.java`
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/model/AccessMeta.java`
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/model/ParamMeta.java`
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/model/RequestMeta.java`
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/model/OperationMeta.java`
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/model/DtoMeta.java`
- Test: `FRAMEWORK/spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/web/meta/model/IrJsonShapeTest.java`

The JSON shapes mirror spec §4 exactly. All records use `@JsonInclude(NON_NULL)` so absent members disappear from the wire.

- [ ] **Step 1: Write the failing test**

```java
package dev.simplecore.simplix.web.meta.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class IrJsonShapeTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void typeRefContainerNestsArgs() throws Exception {
        TypeRef page = TypeRef.container("SimpliXApiResponse",
                List.of(TypeRef.container("Page", List.of(TypeRef.ref("SiteListDTO")))));
        String json = mapper.writeValueAsString(page);
        assertThat(json).isEqualTo(
            "{\"kind\":\"container\",\"name\":\"SimpliXApiResponse\",\"args\":[" +
            "{\"kind\":\"container\",\"name\":\"Page\",\"args\":[{\"kind\":\"ref\",\"name\":\"SiteListDTO\"}]}]}");
    }

    @Test
    void typeMetaSerializesExtendsKeyword() throws Exception {
        TypeMeta meta = new TypeMeta("a.b.C$UpdateDTO", "CreateDTO", List.of(), null, List.of());
        String json = mapper.writeValueAsString(meta);
        assertThat(json).contains("\"extends\":\"CreateDTO\"");
    }

    @Test
    void accessMetaShapes() throws Exception {
        assertThat(mapper.writeValueAsString(AccessMeta.permission("SYSTEM", "edit")))
            .isEqualTo("{\"kind\":\"permission\",\"group\":\"SYSTEM\",\"action\":\"edit\"}");
        assertThat(mapper.writeValueAsString(AccessMeta.publicAccess()))
            .isEqualTo("{\"kind\":\"public\"}");
    }

    @Test
    void numberCarriesIntegralFlagAndOthersOmitIt() throws Exception {
        assertThat(mapper.writeValueAsString(TypeRef.number(true)))
            .isEqualTo("{\"kind\":\"number\",\"integral\":true}");
        assertThat(mapper.writeValueAsString(TypeRef.string()))
            .isEqualTo("{\"kind\":\"string\"}");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test --tests 'dev.simplecore.simplix.web.meta.model.IrJsonShapeTest'`
Expected: compile FAILURE — records do not exist.

- [ ] **Step 3: Write the records**

`TypeRef.java`:

```java
package dev.simplecore.simplix.web.meta.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * Discriminated type reference (spec §4). {@code kind} selects the shape; members not used by a
 * kind stay {@code null} and vanish from JSON via NON_NULL.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record TypeRef(
        String kind,
        String name,
        Boolean integral,
        String pattern,
        List<TypeRef> args,
        String of,
        List<String> fields) {

    public static TypeRef string() { return bare("string"); }
    public static TypeRef bool() { return bare("boolean"); }
    public static TypeRef unknown() { return bare("unknown"); }
    public static TypeRef instant() { return bare("instant"); }
    public static TypeRef date() { return bare("date"); }
    public static TypeRef file() { return bare("file"); }
    public static TypeRef binary() { return bare("binary"); }

    public static TypeRef number(boolean integral) {
        return new TypeRef("number", null, integral, null, null, null, null);
    }

    public static TypeRef time(String pattern) {
        return new TypeRef("time", null, null, pattern, null, null, null);
    }

    public static TypeRef enumRef(String name) {
        return new TypeRef("enum", name, null, null, null, null, null);
    }

    public static TypeRef ref(String name) {
        return new TypeRef("ref", name, null, null, null, null, null);
    }

    public static TypeRef ref(String name, List<TypeRef> args) {
        return new TypeRef("ref", name, null, null, args, null, null);
    }

    public static TypeRef param(String name) {
        return new TypeRef("param", name, null, null, null, null, null);
    }

    public static TypeRef container(String name, List<TypeRef> args) {
        return new TypeRef("container", name, null, null, args, null, null);
    }

    public static TypeRef pick(String of, List<String> fields) {
        return new TypeRef("pick", null, null, null, null, of, fields);
    }

    private static TypeRef bare(String kind) {
        return new TypeRef(kind, null, null, null, null, null, null);
    }
}
```

`ConstraintMeta.java`:

```java
package dev.simplecore.simplix.web.meta.model;

import com.fasterxml.jackson.annotation.JsonInclude;

/** One validation constraint (spec §5). {@code custom} carries the annotation's simple name. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConstraintMeta(String kind, Object value, String name) {

    public static ConstraintMeta of(String kind) { return new ConstraintMeta(kind, null, null); }

    public static ConstraintMeta of(String kind, Object value) { return new ConstraintMeta(kind, value, null); }

    public static ConstraintMeta custom(String name) { return new ConstraintMeta("custom", null, name); }
}
```

`SearchableMeta.java`:

```java
package dev.simplecore.simplix.web.meta.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/** Search capability of a field, read from {@code @SearchableField} (spec §4). */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record SearchableMeta(List<String> operators, boolean sortable, String entityField, String sortField) {}
```

`FieldMeta.java`:

```java
package dev.simplecore.simplix.web.meta.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/** One serialized property of a DTO (spec §4). {@code name} is the wire name after Jackson. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record FieldMeta(
        String name,
        TypeRef type,
        boolean required,
        boolean nullable,
        String description,
        String labelKey,
        String label,
        List<ConstraintMeta> constraints,
        SearchableMeta searchable) {}
```

`TypeMeta.java`:

```java
package dev.simplecore.simplix.web.meta.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/** One DTO type; carries ONLY its own fields — inherited ones live on {@code extends} (spec §4). */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record TypeMeta(
        String javaClass,
        @JsonProperty("extends") String extendsType,
        List<String> typeParams,
        String description,
        List<FieldMeta> fields) {}
```

`EnumMeta.java`:

```java
package dev.simplecore.simplix.web.meta.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/** Enum registry entry (spec §4). {@code labeled} marks the {@code {value,label}} wire shape. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record EnumMeta(boolean labeled, List<Value> values) {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Value(String name, String labelKey) {}
}
```

`AccessMeta.java`:

```java
package dev.simplecore.simplix.web.meta.model;

import com.fasterxml.jackson.annotation.JsonInclude;

/** Structured {@code @PreAuthorize} (spec §4) so the frontend never parses SpEL. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AccessMeta(String kind, String group, String action, String raw) {

    public static AccessMeta permission(String group, String action) {
        return new AccessMeta("permission", group, action, null);
    }

    public static AccessMeta authenticated() { return new AccessMeta("authenticated", null, null, null); }

    public static AccessMeta publicAccess() { return new AccessMeta("public", null, null, null); }

    public static AccessMeta expression(String raw) { return new AccessMeta("expression", null, null, raw); }
}
```

`ParamMeta.java`:

```java
package dev.simplecore.simplix.web.meta.model;

import com.fasterxml.jackson.annotation.JsonInclude;

/** A query or path parameter of an operation. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ParamMeta(String name, TypeRef type, boolean required, String description) {}
```

`RequestMeta.java`:

```java
package dev.simplecore.simplix.web.meta.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/** Request side of an operation (spec §4). {@code searchDto} names the DTO whose
 * {@code @SearchableField}s define this operation's flattened search params. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RequestMeta(String body, String contentType, List<ParamMeta> query, List<ParamMeta> path, String searchDto) {}
```

`OperationMeta.java`:

```java
package dev.simplecore.simplix.web.meta.model;

import com.fasterxml.jackson.annotation.JsonInclude;

/** One handler method (spec §4). {@code response} is the full container-wrapped TypeRef; null = Void. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record OperationMeta(
        String id,
        String method,
        String path,
        String tag,
        String summary,
        RequestMeta request,
        TypeRef response,
        AccessMeta access) {}
```

`DtoMeta.java`:

```java
package dev.simplecore.simplix.web.meta.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

/** Root SimpliX Meta document served by {@code GET /dev/meta/dto} (spec §4). */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record DtoMeta(
        int version,
        Map<String, EnumMeta> enums,
        Map<String, TypeMeta> types,
        List<OperationMeta> operations,
        Map<String, Object> extensions) {}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test --tests 'dev.simplecore.simplix.web.meta.model.IrJsonShapeTest'`
Expected: PASS

- [ ] **Step 5: Commit (FRAMEWORK repo)**

```bash
cd FRAMEWORK
git add spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/model \
        spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/web/meta/model
git commit -m "feat(starter): add SimpliX Meta model records"
```

---

### Task 5: `@PreAuthorize` expression parser

**Files:**
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/AccessExpressionParser.java`
- Test: `FRAMEWORK/spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/web/meta/AccessExpressionParserTest.java`

- [ ] **Step 1: Write the failing test**

```java
package dev.simplecore.simplix.web.meta;

import dev.simplecore.simplix.web.meta.model.AccessMeta;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AccessExpressionParserTest {

    @Test
    void parsesHasPermission() {
        AccessMeta meta = AccessExpressionParser.parse("hasPermission('SYSTEM', 'edit')");
        assertThat(meta.kind()).isEqualTo("permission");
        assertThat(meta.group()).isEqualTo("SYSTEM");
        assertThat(meta.action()).isEqualTo("edit");
    }

    @Test
    void parsesHasPermissionWithoutSpace() {
        AccessMeta meta = AccessExpressionParser.parse("hasPermission('SAFETY_SITE','view')");
        assertThat(meta.group()).isEqualTo("SAFETY_SITE");
        assertThat(meta.action()).isEqualTo("view");
    }

    @Test
    void parsesIsAuthenticated() {
        assertThat(AccessExpressionParser.parse("isAuthenticated()").kind()).isEqualTo("authenticated");
    }

    @Test
    void parsesPermitAll() {
        assertThat(AccessExpressionParser.parse("permitAll()").kind()).isEqualTo("public");
    }

    @Test
    void unknownSpelBecomesRawExpression() {
        AccessMeta meta = AccessExpressionParser.parse("hasPermission('A','edit') and #id != null");
        assertThat(meta.kind()).isEqualTo("expression");
        assertThat(meta.raw()).isEqualTo("hasPermission('A','edit') and #id != null");
    }

    @Test
    void absentAnnotationMeansAuthenticated() {
        // No @PreAuthorize under an authenticated-by-default filter chain: authenticated-only.
        assertThat(AccessExpressionParser.parse(null).kind()).isEqualTo("authenticated");
        assertThat(AccessExpressionParser.parse("  ").kind()).isEqualTo("authenticated");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test --tests 'dev.simplecore.simplix.web.meta.AccessExpressionParserTest'`
Expected: compile FAILURE.

- [ ] **Step 3: Write the parser**

```java
package dev.simplecore.simplix.web.meta;

import dev.simplecore.simplix.web.meta.model.AccessMeta;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Turns the three {@code @PreAuthorize} shapes this convention uses into structured
 * {@link AccessMeta}; anything else travels as a raw expression so the frontend can refuse to
 * guess instead of misreading it as "no permission required".
 */
public final class AccessExpressionParser {

    private static final Pattern HAS_PERMISSION =
            Pattern.compile("^hasPermission\\('([^']+)'\\s*,\\s*'([^']+)'\\)$");

    private AccessExpressionParser() {}

    public static AccessMeta parse(String expression) {
        if (expression == null || expression.isBlank()) {
            return AccessMeta.authenticated();
        }
        String trimmed = expression.trim();
        Matcher permission = HAS_PERMISSION.matcher(trimmed);
        if (permission.matches()) {
            return AccessMeta.permission(permission.group(1), permission.group(2));
        }
        if (trimmed.equals("isAuthenticated()")) {
            return AccessMeta.authenticated();
        }
        if (trimmed.equals("permitAll()")) {
            return AccessMeta.publicAccess();
        }
        return AccessMeta.expression(trimmed);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test --tests 'dev.simplecore.simplix.web.meta.AccessExpressionParserTest'`
Expected: PASS

- [ ] **Step 5: Commit (FRAMEWORK repo)**

```bash
cd FRAMEWORK
git add spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/AccessExpressionParser.java \
        spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/web/meta/AccessExpressionParserTest.java
git commit -m "feat(starter): parse PreAuthorize expressions into structured access meta"
```

---

### Task 6: Constraint extractor (jakarta annotations → SimpliX Meta constraints)

**Files:**
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/ConstraintExtractor.java`
- Test: `FRAMEWORK/spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/web/meta/ConstraintExtractorTest.java`

- [ ] **Step 1: Write the failing test**

```java
package dev.simplecore.simplix.web.meta;

import dev.simplecore.simplix.web.meta.model.ConstraintMeta;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.Length;
import org.junit.jupiter.api.Test;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Field;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ConstraintExtractorTest {

    @Target(ElementType.FIELD)
    @Retention(RetentionPolicy.RUNTIME)
    @Constraint(validatedBy = {})
    @interface Unique {
        String message() default "";
        Class<?>[] groups() default {};
        Class<? extends Payload>[] payload() default {};
    }

    static class Sample {
        @NotBlank @Length(max = 100) String name;
        @Size(min = 1, max = 5) List<String> tags;
        @Min(-1) @Max(9999) Integer occupancy;
        @Pattern(regexp = "^[A-Z]+$") String code;
        @Email String mail;
        @Positive Integer count;
        @Unique String serial;
        String plain;
    }

    private List<ConstraintMeta> extract(String field) throws Exception {
        Field f = Sample.class.getDeclaredField(field);
        return ConstraintExtractor.extract(f, f.getType());
    }

    @Test
    void stringLengthBecomesMinMaxLength() throws Exception {
        assertThat(extract("name")).containsExactlyInAnyOrder(
            ConstraintMeta.of("notBlank"), ConstraintMeta.of("maxLength", 100));
    }

    @Test
    void collectionSizeBecomesItemBounds() throws Exception {
        assertThat(extract("tags")).containsExactlyInAnyOrder(
            ConstraintMeta.of("minItems", 1), ConstraintMeta.of("maxItems", 5));
    }

    @Test
    void numericBoundsAndSigns() throws Exception {
        assertThat(extract("occupancy")).containsExactlyInAnyOrder(
            ConstraintMeta.of("min", -1L), ConstraintMeta.of("max", 9999L));
        assertThat(extract("count")).containsExactly(ConstraintMeta.of("positive"));
    }

    @Test
    void patternAndEmail() throws Exception {
        assertThat(extract("code")).containsExactly(ConstraintMeta.of("pattern", "^[A-Z]+$"));
        assertThat(extract("mail")).containsExactly(ConstraintMeta.of("email"));
    }

    @Test
    void unknownConstraintAnnotationBecomesCustom() throws Exception {
        assertThat(extract("serial")).containsExactly(ConstraintMeta.custom("Unique"));
    }

    @Test
    void unconstrainedFieldYieldsEmptyList() throws Exception {
        assertThat(extract("plain")).isEmpty();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test --tests 'dev.simplecore.simplix.web.meta.ConstraintExtractorTest'`
Expected: compile FAILURE.

- [ ] **Step 3: Write the extractor**

```java
package dev.simplecore.simplix.web.meta;

import dev.simplecore.simplix.web.meta.model.ConstraintMeta;
import jakarta.validation.Constraint;
import jakarta.validation.constraints.AssertFalse;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Negative;
import jakarta.validation.constraints.NegativeOrZero;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.Length;

import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedElement;
import java.util.ArrayList;
import java.util.List;

/**
 * Maps jakarta/hibernate validation annotations to SimpliX Meta constraints (spec §5).
 *
 * <p>{@code @NotNull} is deliberately NOT emitted here — it feeds the {@code required} flag.
 * Unknown {@code @Constraint}-meta-annotated annotations become {@code custom} entries, which
 * the generator surfaces as server-only checks instead of silently dropping.
 */
public final class ConstraintExtractor {

    private ConstraintExtractor() {}

    public static List<ConstraintMeta> extract(AnnotatedElement element, Class<?> fieldType) {
        List<ConstraintMeta> result = new ArrayList<>();
        boolean stringLike = CharSequence.class.isAssignableFrom(fieldType);

        for (Annotation annotation : element.getAnnotations()) {
            if (annotation instanceof NotBlank) result.add(ConstraintMeta.of("notBlank"));
            else if (annotation instanceof NotEmpty) result.add(ConstraintMeta.of("notEmpty"));
            else if (annotation instanceof Size size) addBounds(result, stringLike, size.min(), size.max());
            else if (annotation instanceof Length length) addBounds(result, true, length.min(), length.max());
            else if (annotation instanceof Min min) result.add(ConstraintMeta.of("min", min.value()));
            else if (annotation instanceof Max max) result.add(ConstraintMeta.of("max", max.value()));
            else if (annotation instanceof DecimalMin min) result.add(ConstraintMeta.of("min", min.value()));
            else if (annotation instanceof DecimalMax max) result.add(ConstraintMeta.of("max", max.value()));
            else if (annotation instanceof Positive) result.add(ConstraintMeta.of("positive"));
            else if (annotation instanceof PositiveOrZero) result.add(ConstraintMeta.of("nonnegative"));
            else if (annotation instanceof Negative) result.add(ConstraintMeta.of("negative"));
            else if (annotation instanceof NegativeOrZero) result.add(ConstraintMeta.of("nonpositive"));
            else if (annotation instanceof Pattern pattern) result.add(ConstraintMeta.of("pattern", pattern.regexp()));
            else if (annotation instanceof Email) result.add(ConstraintMeta.of("email"));
            else if (annotation instanceof AssertTrue) result.add(ConstraintMeta.of("assertTrue"));
            else if (annotation instanceof AssertFalse) result.add(ConstraintMeta.of("assertFalse"));
            else if (annotation instanceof NotNull) { /* feeds required, not a constraint entry */ }
            else if (annotation.annotationType().isAnnotationPresent(Constraint.class)) {
                result.add(ConstraintMeta.custom(annotation.annotationType().getSimpleName()));
            }
        }
        return result;
    }

    private static void addBounds(List<ConstraintMeta> result, boolean stringLike, int min, int max) {
        String minKind = stringLike ? "minLength" : "minItems";
        String maxKind = stringLike ? "maxLength" : "maxItems";
        if (min > 0) result.add(ConstraintMeta.of(minKind, min));
        if (max != Integer.MAX_VALUE) result.add(ConstraintMeta.of(maxKind, max));
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test --tests 'dev.simplecore.simplix.web.meta.ConstraintExtractorTest'`
Expected: PASS

- [ ] **Step 5: Commit (FRAMEWORK repo)**

```bash
cd FRAMEWORK
git add spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/ConstraintExtractor.java \
        spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/web/meta/ConstraintExtractorTest.java
git commit -m "feat(starter): extract jakarta validation constraints into SimpliX Meta"
```

---

### Task 7: Type mapper and type registry (Java types → `TypeRef`)

**Files:**
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/MetaTypeRegistry.java`
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/TypeRefMapper.java`
- Test: `FRAMEWORK/spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/web/meta/TypeRefMapperTest.java`

- [ ] **Step 1: Write the failing test**

```java
package dev.simplecore.simplix.web.meta;

import dev.simplecore.simplix.core.model.SimpliXApiResponse;
import dev.simplecore.simplix.web.meta.model.TypeRef;
import org.junit.jupiter.api.Test;
import org.springframework.core.ResolvableType;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class TypeRefMapperTest {

    static class SiteListDTO { String name; }

    enum PlainKind { A, B }

    @SuppressWarnings("unused")
    static class Holder {
        String text;
        boolean flag;
        int count;
        Double ratio;
        Instant createdAt;
        LocalDate day;
        LocalTime openAt;
        PlainKind kind;
        SiteListDTO site;
        List<SiteListDTO> sites;
        Map<String, Integer> counts;
        MultipartFile upload;
        SimpliXApiResponse<Page<SiteListDTO>> pageResponse;
        SimpliXApiResponse<Void> voidResponse;
    }

    private final MetaTypeRegistry registry = new MetaTypeRegistry();
    private final TypeRefMapper mapper = new TypeRefMapper(registry);

    private TypeRef map(String field) throws Exception {
        return mapper.map(ResolvableType.forField(Holder.class.getDeclaredField(field)));
    }

    @Test
    void primitivesAndStrings() throws Exception {
        assertThat(map("text")).isEqualTo(TypeRef.string());
        assertThat(map("flag")).isEqualTo(TypeRef.bool());
        assertThat(map("count")).isEqualTo(TypeRef.number(true));
        assertThat(map("ratio")).isEqualTo(TypeRef.number(false));
    }

    @Test
    void temporalKindsStayDistinct() throws Exception {
        assertThat(map("createdAt")).isEqualTo(TypeRef.instant());
        assertThat(map("day")).isEqualTo(TypeRef.date());
        assertThat(map("openAt")).isEqualTo(TypeRef.time(null));
    }

    @Test
    void enumAndDtoRegisterThemselves() throws Exception {
        assertThat(map("kind")).isEqualTo(TypeRef.enumRef("PlainKind"));
        assertThat(map("site")).isEqualTo(TypeRef.ref("SiteListDTO"));
        assertThat(registry.pendingTypes()).contains(SiteListDTO.class);
        assertThat(registry.enums()).containsKey(PlainKind.class);
    }

    @Test
    void containersNest() throws Exception {
        assertThat(map("sites"))
            .isEqualTo(TypeRef.container("List", List.of(TypeRef.ref("SiteListDTO"))));
        assertThat(map("counts"))
            .isEqualTo(TypeRef.container("Map", List.of(TypeRef.number(true))));
        assertThat(map("pageResponse"))
            .isEqualTo(TypeRef.container("SimpliXApiResponse",
                List.of(TypeRef.container("Page", List.of(TypeRef.ref("SiteListDTO"))))));
    }

    @Test
    void voidBodyCollapsesToNullArg() throws Exception {
        assertThat(map("voidResponse"))
            .isEqualTo(TypeRef.container("SimpliXApiResponse", List.of()));
    }

    @Test
    void multipartIsFile() throws Exception {
        assertThat(map("upload")).isEqualTo(TypeRef.file());
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test --tests 'dev.simplecore.simplix.web.meta.TypeRefMapperTest'`
Expected: compile FAILURE.

- [ ] **Step 3: Write the registry and mapper**

`MetaTypeRegistry.java`:

```java
package dev.simplecore.simplix.web.meta;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

/**
 * Collects DTO classes and enums discovered while mapping types. DTOs queue into a worklist so
 * the builder can process them iteratively — recursion-safe for self-referencing trees.
 */
public class MetaTypeRegistry {

    private final Set<Class<?>> seen = new LinkedHashSet<>();
    private final Deque<Class<?>> pending = new ArrayDeque<>();
    private final Map<Class<?>, String> enums = new LinkedHashMap<>();

    /** Registers a DTO class (idempotent) and returns its SimpliX Meta type name. */
    public String register(Class<?> type) {
        if (seen.add(type)) {
            pending.add(type);
        }
        return typeName(type);
    }

    /** Registers an enum (idempotent) and returns its SimpliX Meta name. */
    public String registerEnum(Class<?> enumType) {
        return enums.computeIfAbsent(enumType, MetaTypeRegistry::typeName);
    }

    public boolean hasPending() { return !pending.isEmpty(); }

    public Class<?> next() { return pending.remove(); }

    public Deque<Class<?>> pendingTypes() { return pending; }

    public Map<Class<?>, String> enums() { return enums; }

    /** Nested DTOs use the enclosing-stripped simple name: {@code AccessAreaDTOs$CreateDTO → CreateDTO}. */
    public static String typeName(Class<?> type) {
        return type.getSimpleName();
    }
}
```

`TypeRefMapper.java`:

```java
package dev.simplecore.simplix.web.meta;

import dev.simplecore.simplix.web.meta.model.TypeRef;
import org.springframework.core.ResolvableType;

import java.lang.reflect.TypeVariable;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Maps a {@link ResolvableType} to a SimpliX Meta document {@link TypeRef} (spec §4). Container names are the
 * JAVA names — the CLI profile owns the TypeScript mapping (spec §4.1).
 */
public class TypeRefMapper {

    private static final Set<Class<?>> INTEGRAL =
            Set.of(byte.class, short.class, int.class, long.class,
                   Byte.class, Short.class, Integer.class, Long.class, BigInteger.class);
    private static final Set<Class<?>> FRACTIONAL =
            Set.of(float.class, double.class, Float.class, Double.class, BigDecimal.class);
    private static final Set<String> BINARY_CLASS_NAMES = Set.of(
            "org.springframework.core.io.Resource",
            "org.springframework.core.io.InputStreamResource",
            "org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody");

    private final MetaTypeRegistry registry;

    public TypeRefMapper(MetaTypeRegistry registry) {
        this.registry = registry;
    }

    /** Returns null for void/Void — an operation with no response body. */
    public TypeRef map(ResolvableType resolvable) {
        if (resolvable.getType() instanceof TypeVariable<?> variable) {
            return TypeRef.param(variable.getName());
        }
        Class<?> raw = resolvable.resolve(Object.class);

        if (raw == void.class || raw == Void.class) return null;
        if (raw == Object.class) return TypeRef.unknown();
        if (CharSequence.class.isAssignableFrom(raw) || raw == UUID.class || raw == char.class || raw == Character.class) {
            return TypeRef.string();
        }
        if (raw == boolean.class || raw == Boolean.class) return TypeRef.bool();
        if (INTEGRAL.contains(raw)) return TypeRef.number(true);
        if (FRACTIONAL.contains(raw)) return TypeRef.number(false);
        if (raw == Instant.class || raw == OffsetDateTime.class || raw == ZonedDateTime.class
                || raw == LocalDateTime.class) {
            return TypeRef.instant();
        }
        if (raw == LocalDate.class) return TypeRef.date();
        if (raw == LocalTime.class) return TypeRef.time(null);
        if (raw == byte[].class || BINARY_CLASS_NAMES.contains(raw.getName())
                || isAssignableToName(raw, "org.springframework.core.io.Resource")) {
            return TypeRef.binary();
        }
        if (isAssignableToName(raw, "org.springframework.web.multipart.MultipartFile")) {
            return TypeRef.file();
        }
        if (raw.isEnum()) {
            return TypeRef.enumRef(registry.registerEnum(raw));
        }
        if (raw.getName().equals("org.springframework.http.ResponseEntity")) {
            return map(resolvable.getGeneric(0));
        }
        if (Map.class.isAssignableFrom(raw)) {
            TypeRef value = map(resolvable.getGeneric(1));
            return TypeRef.container("Map", value == null ? List.of() : List.of(value));
        }
        if (Collection.class.isAssignableFrom(raw) || raw.isArray()) {
            ResolvableType element = raw.isArray()
                    ? resolvable.getComponentType() : resolvable.getGeneric(0);
            TypeRef elementRef = map(element);
            return TypeRef.container("List", elementRef == null ? List.of() : List.of(elementRef));
        }
        if (raw.getName().equals("dev.simplecore.simplix.core.model.SimpliXApiResponse")) {
            TypeRef body = map(resolvable.getGeneric(0));
            return TypeRef.container("SimpliXApiResponse", body == null ? List.of() : List.of(body));
        }
        if (raw.getName().equals("org.springframework.data.domain.Page")
                || raw.getName().equals("org.springframework.data.domain.Slice")) {
            TypeRef element = map(resolvable.getGeneric(0));
            return TypeRef.container("Page", element == null ? List.of() : List.of(element));
        }
        // Anything else is a DTO: register it for the worklist and reference it by name.
        return TypeRef.ref(registry.register(raw));
    }

    private static boolean isAssignableToName(Class<?> type, String interfaceName) {
        if (type.getName().equals(interfaceName)) return true;
        for (Class<?> iface : type.getInterfaces()) {
            if (isAssignableToName(iface, interfaceName)) return true;
        }
        Class<?> parent = type.getSuperclass();
        return parent != null && isAssignableToName(parent, interfaceName);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test --tests 'dev.simplecore.simplix.web.meta.TypeRefMapperTest'`
Expected: PASS

- [ ] **Step 5: Commit (FRAMEWORK repo)**

```bash
cd FRAMEWORK
git add spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/MetaTypeRegistry.java \
        spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/TypeRefMapper.java \
        spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/web/meta/TypeRefMapperTest.java
git commit -m "feat(starter): map Java types to SimpliX Meta type references"
```

---

### Task 8: `TypeMetaFactory` — fields, inheritance, labels, searchable

**Files:**
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/TypeMetaFactory.java`
- Test: `FRAMEWORK/spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/web/meta/TypeMetaFactoryTest.java`

Two truths merge here (spec §3): **the application's `ObjectMapper` bean** answers what serializes
under which wire name, reflection answers declarations (constraints, labels, searchable, inheritance).

- [ ] **Step 1: Write the failing test**

```java
package dev.simplecore.simplix.web.meta;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.simplecore.simplix.core.annotation.FieldLabel;
import dev.simplecore.simplix.web.meta.model.FieldMeta;
import dev.simplecore.simplix.web.meta.model.TypeMeta;
import dev.simplecore.simplix.web.meta.model.TypeRef;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TypeMetaFactoryTest {

    @Getter @Setter
    static class CreateDTO {
        @NotBlank @Length(max = 100)
        @FieldLabel("{entities.Area.name}")
        @Schema(description = "Display name")
        private String name;

        @NotNull
        private Integer occupancyMax;

        @JsonIgnore
        private String internalNote;

        @JsonProperty("renamed")
        private String original;
    }

    @Getter @Setter
    static class UpdateDTO extends CreateDTO {
        @NotBlank
        private String id;
    }

    @Getter @Setter
    static class DetailDTO {
        private long version;             // primitive → required without any annotation
        @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
        private String siteId;            // declared required by the server
        private String note;              // neither → optional
    }

    private final MetaTypeRegistry registry = new MetaTypeRegistry();
    private final TypeMetaFactory factory =
            new TypeMetaFactory(new ObjectMapper(), new TypeRefMapper(registry), registry);

    private FieldMeta field(TypeMeta meta, String name) {
        return meta.fields().stream().filter(f -> f.name().equals(name)).findFirst().orElseThrow();
    }

    @Test
    void ownFieldsOnlyAndExtendsChain() {
        TypeMeta update = factory.create(UpdateDTO.class);
        assertThat(update.extendsType()).isEqualTo("CreateDTO");
        assertThat(update.fields()).extracting(FieldMeta::name).containsExactly("id");
        // The parent registered itself for processing.
        assertThat(registry.pendingTypes()).contains(CreateDTO.class);
    }

    @Test
    void jacksonDecidesMembershipAndWireNames() {
        TypeMeta create = factory.create(CreateDTO.class);
        assertThat(create.fields()).extracting(FieldMeta::name)
            .containsExactlyInAnyOrder("name", "occupancyMax", "renamed");
    }

    @Test
    void labelsConstraintsAndDescriptions() {
        TypeMeta create = factory.create(CreateDTO.class);
        FieldMeta name = field(create, "name");
        assertThat(name.labelKey()).isEqualTo("entities.Area.name");
        assertThat(name.label()).isNull();
        assertThat(name.description()).isEqualTo("Display name");
        assertThat(name.required()).isTrue();
        assertThat(name.constraints()).extracting(c -> c.kind())
            .containsExactlyInAnyOrder("notBlank", "maxLength");
    }

    @Test
    void requirednessComesFromDeclarationsOnly() {
        TypeMeta detail = factory.create(DetailDTO.class);
        assertThat(field(detail, "version").required()).isTrue();     // primitive
        assertThat(field(detail, "siteId").required()).isTrue();      // @Schema REQUIRED
        assertThat(field(detail, "note").required()).isFalse();       // nothing declared
        assertThat(field(detail, "version").type()).isEqualTo(TypeRef.number(true));
    }
}
```

Note: if the starter test sourceSet lacks Lombok, replace `@Getter @Setter` in the test fixtures
with hand-written getters/setters — the factory must not care which produced them.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test --tests 'dev.simplecore.simplix.web.meta.TypeMetaFactoryTest'`
Expected: compile FAILURE.

- [ ] **Step 3: Write the factory**

```java
package dev.simplecore.simplix.web.meta;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.BeanDescription;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.introspect.AnnotatedField;
import com.fasterxml.jackson.databind.introspect.BeanPropertyDefinition;
import dev.simplecore.simplix.core.annotation.FieldLabel;
import dev.simplecore.simplix.web.meta.model.ConstraintMeta;
import dev.simplecore.simplix.web.meta.model.FieldMeta;
import dev.simplecore.simplix.web.meta.model.SearchableMeta;
import dev.simplecore.simplix.web.meta.model.TypeMeta;
import dev.simplecore.simplix.web.meta.model.TypeRef;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.core.ResolvableType;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Builds a {@link TypeMeta} for one DTO class. Serialization membership and wire names come from
 * the APPLICATION's ObjectMapper (spec §3 — never a fresh one); declarations come from the
 * backing field: constraints, {@code @FieldLabel}, {@code @SearchableField} (reflectively, the
 * library is optional), {@code @Schema}, {@code @JsonFormat} patterns.
 */
public class TypeMetaFactory {

    private static final Pattern MESSAGE_KEY = Pattern.compile("^\\{(.+)}$");
    private static final String SEARCHABLE_FIELD = "dev.simplecore.searchable.core.annotation.SearchableField";

    private final ObjectMapper mapper;
    private final TypeRefMapper typeRefMapper;
    private final MetaTypeRegistry registry;

    public TypeMetaFactory(ObjectMapper mapper, TypeRefMapper typeRefMapper, MetaTypeRegistry registry) {
        this.mapper = mapper;
        this.typeRefMapper = typeRefMapper;
        this.registry = registry;
    }

    public TypeMeta create(Class<?> type) {
        BeanDescription bean = mapper.getSerializationConfig()
                .introspect(mapper.constructType(type));

        List<FieldMeta> fields = new ArrayList<>();
        for (BeanPropertyDefinition property : bean.findProperties()) {
            Field backing = backingField(property);
            Class<?> declaring = backing != null ? backing.getDeclaringClass()
                    : property.getAccessor() != null ? property.getAccessor().getDeclaringClass() : type;
            if (!declaring.equals(type)) continue; // inherited — lives on the parent TypeMeta
            fields.add(toFieldMeta(property, backing, type));
        }

        String extendsType = null;
        Class<?> parent = type.getSuperclass();
        if (parent != null && parent != Object.class && !parent.getName().startsWith("java.")) {
            extendsType = registry.register(parent);
        }

        List<String> typeParams = Arrays.stream(type.getTypeParameters())
                .map(p -> (String) p.getName()).toList();

        Schema classSchema = type.getAnnotation(Schema.class);
        String description = classSchema != null && !classSchema.description().isEmpty()
                ? classSchema.description() : null;

        return new TypeMeta(type.getName(), extendsType, typeParams, description, fields);
    }

    private FieldMeta toFieldMeta(BeanPropertyDefinition property, Field backing, Class<?> owner) {
        ResolvableType resolvable = backing != null
                ? ResolvableType.forField(backing, owner)
                : ResolvableType.forMethodReturnType((Method) property.getAccessor().getAnnotated());
        TypeRef type = typeRefMapper.map(resolvable);

        String description = null;
        String labelKey = null;
        String label = null;
        List<ConstraintMeta> constraints = List.of();
        SearchableMeta searchable = null;
        boolean required = resolvable.resolve(Object.class).isPrimitive();

        if (backing != null) {
            Schema schema = backing.getAnnotation(Schema.class);
            if (schema != null) {
                if (!schema.description().isEmpty()) description = schema.description();
                if (schema.requiredMode() == Schema.RequiredMode.REQUIRED) required = true;
            }
            FieldLabel fieldLabel = backing.getAnnotation(FieldLabel.class);
            if (fieldLabel != null) {
                Matcher key = MESSAGE_KEY.matcher(fieldLabel.value());
                if (key.matches()) labelKey = key.group(1); else label = fieldLabel.value();
            }
            if (backing.isAnnotationPresent(NotNull.class)
                    || backing.isAnnotationPresent(NotBlank.class)
                    || backing.isAnnotationPresent(NotEmpty.class)) {
                required = true;
            }
            constraints = ConstraintExtractor.extract(backing, resolvable.resolve(Object.class));
            searchable = readSearchable(backing);

            JsonFormat format = backing.getAnnotation(JsonFormat.class);
            if (format != null && !format.pattern().isEmpty()
                    && resolvable.resolve(Object.class) == LocalTime.class) {
                type = TypeRef.time(format.pattern());
            }
        }

        boolean nullable = !required;
        return new FieldMeta(property.getName(), type, required, nullable,
                description, labelKey, label,
                constraints.isEmpty() ? null : constraints, searchable);
    }

    private Field backingField(BeanPropertyDefinition property) {
        AnnotatedField field = property.getField();
        return field != null ? (Field) field.getAnnotated() : null;
    }

    /** searchable-jpa is optional on the classpath — read its annotation by name (spec §3). */
    private SearchableMeta readSearchable(Field field) {
        for (Annotation annotation : field.getAnnotations()) {
            if (!annotation.annotationType().getName().equals(SEARCHABLE_FIELD)) continue;
            try {
                Object[] operators = (Object[]) annotation.annotationType()
                        .getMethod("operators").invoke(annotation);
                boolean sortable = (Boolean) annotation.annotationType()
                        .getMethod("sortable").invoke(annotation);
                String entityField = (String) annotation.annotationType()
                        .getMethod("entityField").invoke(annotation);
                String sortField = (String) annotation.annotationType()
                        .getMethod("sortField").invoke(annotation);
                List<String> operatorNames = Arrays.stream(operators)
                        .map(o -> ((Enum<?>) o).name()).toList();
                return new SearchableMeta(operatorNames, sortable,
                        entityField.isEmpty() ? null : entityField,
                        sortField.isEmpty() ? null : sortField);
            } catch (ReflectiveOperationException e) {
                throw new IllegalStateException("Failed to read @SearchableField on " + field, e);
            }
        }
        return null;
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test --tests 'dev.simplecore.simplix.web.meta.TypeMetaFactoryTest'`
Expected: PASS

- [ ] **Step 5: Commit (FRAMEWORK repo)**

```bash
cd FRAMEWORK
git add spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/TypeMetaFactory.java \
        spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/web/meta/TypeMetaFactoryTest.java
git commit -m "feat(starter): build type meta with inheritance, labels and searchable info"
```

---

### Task 9: `DtoMetaBuilder`, operations, and the contributor SPI

**Files:**
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/SimpliXMetaContributor.java`
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/DtoMetaBuilder.java`
- Test: `FRAMEWORK/spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/web/meta/DtoMetaBuilderTest.java`

`DtoMeta` is unchanged in this task. Duplicate DTO simple names are rejected by
`MetaTypeRegistry` with an `IllegalStateException` (Task 7), so a colliding application fails the
endpoint call outright rather than serving a SimpliX Meta document with one type silently overwritten.

SPI note: spec §6 sketches builder-style signatures; the binding behavior it states is
"an app `@Component` adds its data to SimpliX Meta's `extensions`". The SPI below delivers exactly that
capability with the built records passed read-only — record this divergence from the sketch in
the task's completion report so the spec's §6 example can be aligned afterwards.

- [ ] **Step 1: Write the failing test**

```java
package dev.simplecore.simplix.web.meta;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.simplecore.simplix.core.enums.LabeledEnum;
import dev.simplecore.simplix.core.model.SimpliXApiResponse;
import dev.simplecore.simplix.web.meta.model.DtoMeta;
import dev.simplecore.simplix.web.meta.model.OperationMeta;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.util.pattern.PathPatternParser;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class DtoMetaBuilderTest {

    enum AreaKind implements LabeledEnum { AREA, ZONE }

    static class AreaCreateDTO {
        @NotBlank public String name;
        public AreaKind kind;
    }

    static class AreaListDTO {
        public String id;
        public String name;
    }

    @RestController
    @RequestMapping("/areas")
    @Tag(name = "site.Area")
    static class AreaRestController {

        @GetMapping("/{areaId}")
        @PreAuthorize("hasPermission('SAFETY_SITE', 'view')")
        public SimpliXApiResponse<AreaListDTO> get(@PathVariable("areaId") String areaId) { return null; }

        @PostMapping
        @PreAuthorize("hasPermission('SAFETY_SITE', 'edit')")
        public SimpliXApiResponse<AreaListDTO> create(@RequestBody AreaCreateDTO dto) { return null; }

        @GetMapping
        public SimpliXApiResponse<Page<AreaListDTO>> list(
                @RequestParam(name = "keyword", required = false) String keyword) { return null; }
    }

    private Map<RequestMappingInfo, HandlerMethod> handlerMethods() throws Exception {
        AreaRestController controller = new AreaRestController();
        RequestMappingInfo.BuilderConfiguration config = new RequestMappingInfo.BuilderConfiguration();
        config.setPatternParser(new PathPatternParser());
        Map<RequestMappingInfo, HandlerMethod> map = new LinkedHashMap<>();
        map.put(RequestMappingInfo.paths("/areas/{areaId}").methods(org.springframework.web.bind.annotation.RequestMethod.GET).options(config).build(),
                new HandlerMethod(controller, AreaRestController.class.getMethod("get", String.class)));
        map.put(RequestMappingInfo.paths("/areas").methods(org.springframework.web.bind.annotation.RequestMethod.POST).options(config).build(),
                new HandlerMethod(controller, AreaRestController.class.getMethod("create", AreaCreateDTO.class)));
        map.put(RequestMappingInfo.paths("/areas").methods(org.springframework.web.bind.annotation.RequestMethod.GET).options(config).build(),
                new HandlerMethod(controller, AreaRestController.class.getMethod("list", String.class)));
        return map;
    }

    private DtoMeta build(List<SimpliXMetaContributor> contributors) throws Exception {
        return new DtoMetaBuilder(new ObjectMapper(), contributors).build(handlerMethods());
    }

    private OperationMeta operation(DtoMeta meta, String id) {
        return meta.operations().stream().filter(o -> o.id().equals(id)).findFirst().orElseThrow();
    }

    @Test
    void operationIdTagAccessAndResponse() throws Exception {
        DtoMeta meta = build(List.of());
        OperationMeta get = operation(meta, "Area_get");
        assertThat(get.method()).isEqualTo("GET");
        assertThat(get.path()).isEqualTo("/areas/{areaId}");
        assertThat(get.tag()).isEqualTo("site.Area");
        assertThat(get.access().kind()).isEqualTo("permission");
        assertThat(get.access().action()).isEqualTo("view");
        assertThat(get.request().path()).extracting(p -> p.name()).containsExactly("areaId");
        assertThat(get.response().name()).isEqualTo("SimpliXApiResponse");
    }

    @Test
    void bodyTypeAndReachableTypesRegister() throws Exception {
        DtoMeta meta = build(List.of());
        assertThat(operation(meta, "Area_create").request().body()).isEqualTo("AreaCreateDTO");
        assertThat(meta.types()).containsKeys("AreaCreateDTO", "AreaListDTO");
        assertThat(meta.enums().get("AreaKind").labeled()).isTrue();
        assertThat(meta.enums().get("AreaKind").values())
            .extracting(v -> v.name()).containsExactly("AREA", "ZONE");
    }

    @Test
    void queryParamsAndDefaultAccess() throws Exception {
        DtoMeta meta = build(List.of());
        OperationMeta list = operation(meta, "Area_list");
        assertThat(list.request().query()).extracting(p -> p.name()).containsExactly("keyword");
        assertThat(list.access().kind()).isEqualTo("authenticated");
    }

    @Test
    void contributorsWriteIntoExtensions() throws Exception {
        SimpliXMetaContributor contributor = new SimpliXMetaContributor() {
            @Override
            public void contributeOperation(HandlerMethod handler, OperationMeta operation,
                                            Map<String, Object> extensions) {
                extensions.put("op:" + operation.id(), "seen");
            }
        };
        DtoMeta meta = build(List.of(contributor));
        assertThat(meta.extensions()).containsKey("op:Area_get");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test --tests 'dev.simplecore.simplix.web.meta.DtoMetaBuilderTest'`
Expected: compile FAILURE.

- [ ] **Step 3: Write the SPI and builder**

`SimpliXMetaContributor.java`:

```java
package dev.simplecore.simplix.web.meta;

import dev.simplecore.simplix.web.meta.model.OperationMeta;
import org.springframework.web.method.HandlerMethod;

import java.util.Map;

/**
 * Extension point for applications to add their own annotation data to SimpliX Meta (spec §6).
 * Implementations register as Spring beans; whatever they put into {@code extensions} is served
 * under SimpliX Meta's top-level {@code extensions} object.
 */
public interface SimpliXMetaContributor {

    default void contributeType(Class<?> type, String typeName, Map<String, Object> extensions) {}

    default void contributeOperation(HandlerMethod handler, OperationMeta operation,
                                     Map<String, Object> extensions) {}
}
```

`DtoMetaBuilder.java`:

```java
package dev.simplecore.simplix.web.meta;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.simplecore.simplix.core.enums.SimpliXLabeledEnum;
import dev.simplecore.simplix.web.meta.model.AccessMeta;
import dev.simplecore.simplix.web.meta.model.DtoMeta;
import dev.simplecore.simplix.web.meta.model.EnumMeta;
import dev.simplecore.simplix.web.meta.model.OperationMeta;
import dev.simplecore.simplix.web.meta.model.ParamMeta;
import dev.simplecore.simplix.web.meta.model.RequestMeta;
import dev.simplecore.simplix.web.meta.model.TypeMeta;
import dev.simplecore.simplix.web.meta.model.TypeRef;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.core.MethodParameter;
import org.springframework.core.ResolvableType;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Assembles the whole SimpliX Meta (spec §4): walks handler methods for operations, drains the type
 * registry for DTOs, registers enums, and lets contributors extend the result.
 */
public class DtoMetaBuilder {

    private static final String SEARCHABLE_PARAMS = "dev.simplecore.searchable.openapi.annotation.SearchableParams";
    private static final String SEARCH_CONDITION = "dev.simplecore.searchable.core.condition.SearchCondition";

    private final ObjectMapper mapper;
    private final List<SimpliXMetaContributor> contributors;
    private final MetaTypeRegistry registry = new MetaTypeRegistry();
    private final TypeRefMapper typeRefMapper = new TypeRefMapper(registry);

    public DtoMetaBuilder(ObjectMapper mapper, List<SimpliXMetaContributor> contributors) {
        this.mapper = mapper;
        this.contributors = contributors;
    }

    public DtoMeta build(Map<RequestMappingInfo, HandlerMethod> handlerMethods) {
        Map<String, Object> extensions = new LinkedHashMap<>();
        List<OperationMeta> operations = new ArrayList<>();

        handlerMethods.forEach((info, handler) -> {
            if (skip(handler)) return;
            String path = info.getPathPatternsCondition() != null
                    && !info.getPathPatternsCondition().getPatterns().isEmpty()
                    ? info.getPathPatternsCondition().getPatterns().iterator().next().getPatternString()
                    : null;
            if (path == null) return;
            for (RequestMethod method : info.getMethodsCondition().getMethods()) {
                OperationMeta operation = toOperation(path, method.name(), handler);
                operations.add(operation);
                contributors.forEach(c -> c.contributeOperation(handler, operation, extensions));
            }
        });

        Map<String, TypeMeta> types = new LinkedHashMap<>();
        TypeMetaFactory factory = new TypeMetaFactory(mapper, typeRefMapper, registry);
        while (registry.hasPending()) {
            Class<?> type = registry.next();
            String name = MetaTypeRegistry.typeName(type);
            TypeMeta meta = factory.create(type);
            types.put(name, meta);
            contributors.forEach(c -> c.contributeType(type, name, extensions));
        }

        Map<String, EnumMeta> enums = new LinkedHashMap<>();
        registry.enums().forEach((enumClass, name) -> enums.put(name, toEnumMeta(enumClass)));

        return new DtoMeta(1, enums, types, operations,
                extensions.isEmpty() ? null : extensions);
    }

    /** The framework's own dev controllers and infrastructure endpoints stay out of SimpliX Meta.
     * Matched by exact class, not by package — test fixtures live in the same package. */
    private boolean skip(HandlerMethod handler) {
        Class<?> beanType = handler.getBeanType();
        String pkg = beanType.getPackageName();
        return beanType == SimpliXMetaDevController.class
                || beanType.getName().equals("dev.simplecore.simplix.web.i18n.I18nMessagesDevRestController")
                || pkg.startsWith("org.springdoc")
                || pkg.startsWith("org.springframework");
    }

    private OperationMeta toOperation(String path, String httpMethod, HandlerMethod handler) {
        Class<?> beanType = handler.getBeanType();
        String controller = beanType.getSimpleName()
                .replaceFirst("RestController$", "")
                .replaceFirst("Controller$", "");
        String id = controller + "_" + handler.getMethod().getName();

        Tag tag = AnnotatedElementUtils.findMergedAnnotation(beanType, Tag.class);
        String tagName = tag != null ? tag.name() : beanType.getSimpleName();

        Operation openapi = handler.getMethodAnnotation(Operation.class);
        String summary = openapi != null && !openapi.summary().isEmpty() ? openapi.summary() : null;

        PreAuthorize pre = handler.getMethodAnnotation(PreAuthorize.class);
        if (pre == null) pre = AnnotatedElementUtils.findMergedAnnotation(beanType, PreAuthorize.class);
        AccessMeta access = AccessExpressionParser.parse(pre != null ? pre.value() : null);

        String body = null;
        String contentType = null;
        String searchDto = null;
        List<ParamMeta> query = new ArrayList<>();
        List<ParamMeta> pathParams = new ArrayList<>();

        for (MethodParameter parameter : handler.getMethodParameters()) {
            parameter.initParameterNameDiscovery(new DefaultParameterNameDiscoverer());
            Class<?> parameterType = parameter.getParameterType();
            ResolvableType resolvable = ResolvableType.forMethodParameter(parameter);

            String searchableDtoName = searchableParamsDto(parameter);
            if (searchableDtoName != null) {
                searchDto = searchableDtoName;
                continue;
            }
            if (parameterType.getName().equals(SEARCH_CONDITION)) {
                Class<?> conditionDto = resolvable.getGeneric(0).resolve();
                if (conditionDto != null) searchDto = registry.register(conditionDto);
                continue;
            }
            if (parameter.hasParameterAnnotation(RequestBody.class)) {
                Class<?> bodyClass = resolvable.resolve();
                if (bodyClass != null && !Map.class.isAssignableFrom(bodyClass)) {
                    body = registry.register(bodyClass);
                }
                continue;
            }
            if (MultipartFile.class.isAssignableFrom(parameterType)) {
                contentType = "multipart";
                continue;
            }
            PathVariable pathVariable = parameter.getParameterAnnotation(PathVariable.class);
            if (pathVariable != null) {
                String name = firstNonEmpty(pathVariable.name(), pathVariable.value(),
                        parameter.getParameterName());
                pathParams.add(new ParamMeta(name, typeRefMapper.map(resolvable), true, null));
                continue;
            }
            RequestParam requestParam = parameter.getParameterAnnotation(RequestParam.class);
            if (requestParam != null) {
                String name = firstNonEmpty(requestParam.name(), requestParam.value(),
                        parameter.getParameterName());
                query.add(new ParamMeta(name, typeRefMapper.map(resolvable),
                        requestParam.required(), null));
            }
        }
        if (body != null && contentType == null) contentType = "json";
        if (contentType == null && body == null && searchDto == null
                && query.isEmpty() && pathParams.isEmpty()) {
            // leave request minimal but present, matching spec §4
        }

        TypeRef response = typeRefMapper.map(
                ResolvableType.forMethodReturnType(handler.getMethod()));

        RequestMeta request = new RequestMeta(body, contentType, query, pathParams, searchDto);
        return new OperationMeta(id, httpMethod, path, tagName, summary, request, response, access);
    }

    /** Annotation name/value aliases are not merged on direct reads — check both, then bytecode names. */
    private static String firstNonEmpty(String first, String second, String fallback) {
        if (first != null && !first.isEmpty()) return first;
        if (second != null && !second.isEmpty()) return second;
        return fallback;
    }

    private String searchableParamsDto(MethodParameter parameter) {
        for (Annotation annotation : parameter.getParameterAnnotations()) {
            if (!annotation.annotationType().getName().equals(SEARCHABLE_PARAMS)) continue;
            try {
                Class<?> dto = (Class<?>) annotation.annotationType()
                        .getMethod("value").invoke(annotation);
                return registry.register(dto);
            } catch (ReflectiveOperationException e) {
                throw new IllegalStateException("Failed to read @SearchableParams", e);
            }
        }
        return null;
    }

    private EnumMeta toEnumMeta(Class<?> enumClass) {
        boolean labeled = SimpliXLabeledEnum.class.isAssignableFrom(enumClass);
        String simpleName = enumClass.getSimpleName();
        List<EnumMeta.Value> values = Arrays.stream(enumClass.getEnumConstants())
                .map(constant -> new EnumMeta.Value(((Enum<?>) constant).name(),
                        labeled ? "enums." + simpleName + "." + ((Enum<?>) constant).name() : null))
                .toList();
        return new EnumMeta(labeled, values);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test --tests 'dev.simplecore.simplix.web.meta.DtoMetaBuilderTest'`
Expected: PASS

- [ ] **Step 5: Commit (FRAMEWORK repo)**

```bash
cd FRAMEWORK
git add spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/SimpliXMetaContributor.java \
        spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/DtoMetaBuilder.java \
        spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/web/meta/DtoMetaBuilderTest.java
git commit -m "feat(starter): build SimpliX Meta from handler mappings with contributor SPI"
```

---

### Task 10: Dev controller, properties, and auto-configuration

**Files:**
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/SimpliXMetaDevController.java`
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/springboot/autoconfigure/SimpliXDevProperties.java`
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/springboot/autoconfigure/SimpliXDevMetaAutoConfiguration.java`
- Modify: `FRAMEWORK/spring-boot-starter-simplix/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
- Test: `FRAMEWORK/spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/springboot/autoconfigure/SimpliXDevMetaAutoConfigurationTest.java`

- [ ] **Step 1: Write the failing test**

Use `ApplicationContextRunner` — it proves the three gating rules (off by default, on by property,
refused under a production profile) without booting a servlet container.

```java
package dev.simplecore.simplix.springboot.autoconfigure;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.simplecore.simplix.web.meta.SimpliXMetaDevController;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.test.context.runner.WebApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class SimpliXDevMetaAutoConfigurationTest {

    @Configuration
    static class Stubs {
        @Bean ObjectMapper objectMapper() { return new ObjectMapper(); }
        @Bean RequestMappingHandlerMapping requestMappingHandlerMapping() {
            return mock(RequestMappingHandlerMapping.class);
        }
    }

    private final WebApplicationContextRunner runner = new WebApplicationContextRunner()
            .withConfiguration(AutoConfigurations.of(SimpliXDevMetaAutoConfiguration.class))
            .withUserConfiguration(Stubs.class);

    @Test
    void offByDefault() {
        runner.run(context ->
            assertThat(context).doesNotHaveBean(SimpliXMetaDevController.class));
    }

    @Test
    void onWhenPropertyEnabled() {
        runner.withPropertyValues("simplix.dev.meta.enabled=true").run(context ->
            assertThat(context).hasSingleBean(SimpliXMetaDevController.class));
    }

    @Test
    void refusedUnderProductionProfile() {
        runner.withPropertyValues("simplix.dev.meta.enabled=true",
                        "spring.profiles.active=prod")
              .run(context ->
            assertThat(context).doesNotHaveBean(SimpliXMetaDevController.class));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test --tests 'dev.simplecore.simplix.springboot.autoconfigure.SimpliXDevMetaAutoConfigurationTest'`
Expected: compile FAILURE.

- [ ] **Step 3: Write controller, properties, auto-configuration**

`SimpliXMetaDevController.java`:

```java
package dev.simplecore.simplix.web.meta;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.simplecore.simplix.core.model.SimpliXApiResponse;
import dev.simplecore.simplix.web.meta.model.DtoMeta;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.List;
import java.util.Map;

/**
 * Serves SimpliX Meta for frontend code generation (spec §3). Registered only by
 * {@code SimpliXDevMetaAutoConfiguration} — property-gated, never under a production profile.
 * The mapped path sits under the same {@code /dev/**} convention as the i18n dev endpoint, so an
 * application's existing dev-profile permit rule covers it.
 */
@RestController
@RequestMapping("/dev/meta")
public class SimpliXMetaDevController {

    private final RequestMappingHandlerMapping handlerMapping;
    private final ObjectMapper objectMapper;
    private final List<SimpliXMetaContributor> contributors;

    public SimpliXMetaDevController(RequestMappingHandlerMapping handlerMapping,
                                    ObjectMapper objectMapper,
                                    List<SimpliXMetaContributor> contributors) {
        this.handlerMapping = handlerMapping;
        this.objectMapper = objectMapper;
        this.contributors = contributors;
    }

    @GetMapping("/dto")
    public SimpliXApiResponse<DtoMeta> dto() {
        Map<RequestMappingInfo, HandlerMethod> handlerMethods = handlerMapping.getHandlerMethods();
        DtoMeta meta = new DtoMetaBuilder(objectMapper, contributors).build(handlerMethods);
        return SimpliXApiResponse.success(meta);
    }
}
```

`SimpliXDevProperties.java`:

```java
package dev.simplecore.simplix.springboot.autoconfigure;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/** Settings for the framework's dev endpoints (meta + i18n). All off by default. */
@ConfigurationProperties(prefix = "simplix.dev")
public class SimpliXDevProperties {

    /** Enables GET /dev/meta/dto. */
    private boolean metaEnabled;

    /** Enables GET /dev/i18n/messages. */
    private boolean i18nEnabled;

    /** Base packages scanned for labeled enums; empty = auto-configuration packages. */
    private List<String> basePackages = List.of();

    public boolean isMetaEnabled() { return metaEnabled; }
    public void setMetaEnabled(boolean metaEnabled) { this.metaEnabled = metaEnabled; }
    public boolean isI18nEnabled() { return i18nEnabled; }
    public void setI18nEnabled(boolean i18nEnabled) { this.i18nEnabled = i18nEnabled; }
    public List<String> getBasePackages() { return basePackages; }
    public void setBasePackages(List<String> basePackages) { this.basePackages = basePackages; }
}
```

Property names bind as `simplix.dev.meta-enabled` AND `simplix.dev.metaEnabled` by relaxed
binding; the spec's spelling `simplix.dev.meta.enabled` needs nested classes instead — use them:
replace the two booleans with nested `Meta`/`I18n` static classes each holding `enabled` so the
property is literally `simplix.dev.meta.enabled=true`:

```java
package dev.simplecore.simplix.springboot.autoconfigure;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/** Settings for the framework's dev endpoints (meta + i18n). All off by default. */
@ConfigurationProperties(prefix = "simplix.dev")
public class SimpliXDevProperties {

    private final Meta meta = new Meta();
    private final I18n i18n = new I18n();

    /** Base packages scanned for labeled enums; empty = auto-configuration packages. */
    private List<String> basePackages = List.of();

    public Meta getMeta() { return meta; }
    public I18n getI18n() { return i18n; }
    public List<String> getBasePackages() { return basePackages; }
    public void setBasePackages(List<String> basePackages) { this.basePackages = basePackages; }

    public static class Meta {
        private boolean enabled;
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
    }

    public static class I18n {
        private boolean enabled;
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
    }
}
```

Use the second (nested) form only — the first is shown to explain why.

`SimpliXDevMetaAutoConfiguration.java`:

```java
package dev.simplecore.simplix.springboot.autoconfigure;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.simplecore.simplix.web.meta.SimpliXMetaContributor;
import dev.simplecore.simplix.web.meta.SimpliXMetaDevController;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.context.annotation.Conditional;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.List;
import java.util.Set;

/**
 * Registers the DTO meta dev endpoint. Three gates, all must open: servlet web app,
 * {@code simplix.dev.meta.enabled=true}, and no production profile active (spec §3).
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnProperty(name = "simplix.dev.meta.enabled", havingValue = "true")
@Conditional(SimpliXDevMetaAutoConfiguration.NotProductionCondition.class)
@EnableConfigurationProperties(SimpliXDevProperties.class)
public class SimpliXDevMetaAutoConfiguration {

    static class NotProductionCondition implements Condition {
        private static final Set<String> PRODUCTION_PROFILES = Set.of("prod", "production");

        @Override
        public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
            for (String profile : context.getEnvironment().getActiveProfiles()) {
                if (PRODUCTION_PROFILES.contains(profile)) return false;
            }
            return true;
        }
    }

    @Bean
    public SimpliXMetaDevController simpliXMetaDevController(
            RequestMappingHandlerMapping requestMappingHandlerMapping,
            ObjectMapper objectMapper,
            ObjectProvider<SimpliXMetaContributor> contributors) {
        List<SimpliXMetaContributor> resolved = contributors.orderedStream().toList();
        return new SimpliXMetaDevController(requestMappingHandlerMapping, objectMapper, resolved);
    }
}
```

Append to `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`:

```
dev.simplecore.simplix.springboot.autoconfigure.SimpliXDevMetaAutoConfiguration
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test --tests 'dev.simplecore.simplix.springboot.autoconfigure.SimpliXDevMetaAutoConfigurationTest'`
Expected: PASS

- [ ] **Step 5: Run the whole starter test suite (regression gate)**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test :simplix-core:test`
Expected: PASS — the new module must not break existing tests.

- [ ] **Step 6: Commit (FRAMEWORK repo)**

```bash
cd FRAMEWORK
git add spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/meta/SimpliXMetaDevController.java \
        spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/springboot/autoconfigure/SimpliXDevProperties.java \
        spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/springboot/autoconfigure/SimpliXDevMetaAutoConfiguration.java \
        spring-boot-starter-simplix/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports \
        spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/springboot/autoconfigure/SimpliXDevMetaAutoConfigurationTest.java
git commit -m "feat(starter): serve SimpliX Meta at /dev/meta/dto behind property gates"
```

---

### Task 11: i18n dev endpoint migrates into the starter

**Files:**
- Create (copied): `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/i18n/` — controller, service, and DTO classes copied from APP
- Create: `FRAMEWORK/spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/springboot/autoconfigure/SimpliXDevI18nAutoConfiguration.java`
- Modify: `FRAMEWORK/spring-boot-starter-simplix/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
- Test: `FRAMEWORK/spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/springboot/autoconfigure/SimpliXDevI18nAutoConfigurationTest.java`

Sources to copy (APP):
- `modules/common-dev/src/main/java/dev/accesscore/web/common/dev/controller/I18nMessagesDevRestController.java`
- `modules/common-dev/src/main/java/dev/accesscore/web/common/dev/service/I18nMessagesService.java`
- `modules/common-dev/src/main/java/dev/accesscore/web/common/dev/dto/` — `EntityMessages.java`, `EnumMessages.java`, `I18nMessagesResponse.java`, `LocalizedString.java`

- [ ] **Step 1: Copy and repackage**

```bash
cd FRAMEWORK
mkdir -p spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/i18n
APP=/Users/taehwan/Workspace/accesscore/accesscore-smart-safety/smart-safety-backend
cp "$APP/modules/common-dev/src/main/java/dev/accesscore/web/common/dev/controller/I18nMessagesDevRestController.java" \
   "$APP/modules/common-dev/src/main/java/dev/accesscore/web/common/dev/service/I18nMessagesService.java" \
   "$APP"/modules/common-dev/src/main/java/dev/accesscore/web/common/dev/dto/*.java \
   spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/i18n/
perl -pi -e 's/^package dev\.accesscore\.web\.common\.dev\.(controller|service|dto);/package dev.simplecore.simplix.web.i18n;/' \
  spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/i18n/*.java
perl -pi -e 's/^import dev\.accesscore\.web\.common\.dev\.(controller|service|dto)\.[A-Za-z]+;\n//' \
  spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/i18n/*.java
perl -pi -e 's/dev\.accesscore\.domain\.core\.enums\.LabeledEnum/dev.simplecore.simplix.core.enums.LabeledEnum/g; s/dev\.accesscore\.domain\.core\.util\.(EntityMessageResolver|EnumMessageResolver)/dev.simplecore.simplix.core.i18n.$1/g' \
  spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/i18n/*.java
```

- [ ] **Step 2: Replace the app coupling**

Open the copied `I18nMessagesService.java`. It references `dev.accesscore.domain.DomainBasePackage`
(a marker class used as the enum-scan root). Replace that mechanism:
- Add a constructor parameter `List<String> basePackages`.
- Where the marker's package was used as the scan root, iterate `basePackages` instead.
- Delete the `DomainBasePackage` import.
- Remove `@RestController`-discovery annotations (`@Profile`, `@SimpliXStandardApi` stays — it is
  the framework's own annotation; `@Profile({"local","dev"})` is DELETED because gating now comes
  from the auto-configuration's property + not-production condition, uniform with Task 10).
- Remove any `@Service`/`@Component` stereotype from the service — the auto-configuration
  constructs it as a `@Bean`.

- [ ] **Step 3: Write the auto-configuration and its test**

`SimpliXDevI18nAutoConfiguration.java` — same three gates as Task 10, property
`simplix.dev.i18n.enabled`; `basePackages` falls back to
`AutoConfigurationPackages.get(beanFactory)` when the property list is empty:

```java
package dev.simplecore.simplix.springboot.autoconfigure;

import dev.simplecore.simplix.web.i18n.I18nMessagesDevRestController;
import dev.simplecore.simplix.web.i18n.I18nMessagesService;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.AutoConfigurationPackages;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;

import java.util.List;

/** Registers the i18n dev endpoint under the same gates as the meta endpoint (spec §7). */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnProperty(name = "simplix.dev.i18n.enabled", havingValue = "true")
@Conditional(SimpliXDevMetaAutoConfiguration.NotProductionCondition.class)
@EnableConfigurationProperties(SimpliXDevProperties.class)
public class SimpliXDevI18nAutoConfiguration {

    @Bean
    public I18nMessagesService i18nMessagesService(SimpliXDevProperties properties,
                                                   BeanFactory beanFactory) {
        List<String> packages = properties.getBasePackages().isEmpty()
                ? AutoConfigurationPackages.get(beanFactory)
                : properties.getBasePackages();
        return new I18nMessagesService(packages);
    }

    @Bean
    public I18nMessagesDevRestController i18nMessagesDevRestController(I18nMessagesService service) {
        return new I18nMessagesDevRestController(service);
    }
}
```

If the copied service's constructor takes more collaborators than the package list, wire them as
additional `@Bean` method parameters — read the copied source and match it; do not invent
collaborators.

Test — mirror `SimpliXDevMetaAutoConfigurationTest` exactly (off by default / on by
`simplix.dev.i18n.enabled=true` with `AutoConfigurationPackages` registered via
`.withInitializer(ctx -> AutoConfigurationPackages.register((BeanDefinitionRegistry) ctx.getBeanFactory(), "dev.simplecore.simplix"))` / refused under `prod`),
asserting on `I18nMessagesDevRestController`.

Register in `AutoConfiguration.imports`:

```
dev.simplecore.simplix.springboot.autoconfigure.SimpliXDevI18nAutoConfiguration
```

- [ ] **Step 4: Run tests**

Run: `cd FRAMEWORK && ./gradlew :spring-boot-starter-simplix:test`
Expected: PASS

- [ ] **Step 5: Commit (FRAMEWORK repo)**

```bash
cd FRAMEWORK
git add spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/web/i18n \
        spring-boot-starter-simplix/src/main/java/dev/simplecore/simplix/springboot/autoconfigure/SimpliXDevI18nAutoConfiguration.java \
        spring-boot-starter-simplix/src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports \
        spring-boot-starter-simplix/src/test/java/dev/simplecore/simplix/springboot/autoconfigure/SimpliXDevI18nAutoConfigurationTest.java
git commit -m "feat(starter): host the i18n dev endpoint with property-gated auto-configuration"
```

---

### Task 12: Publish the framework to mavenLocal

- [ ] **Step 1: Align the version with the app's pin**

The app pins `simplix = "1.2.5-SNAPSHOT"` (`APP/gradle/libs.versions.toml:19`). Check the
framework's current version:

Run: `cd FRAMEWORK && ./gradlew properties -q | grep '^version:'`
- If it prints `1.2.5-SNAPSHOT` → proceed.
- If it prints something else → publish with an explicit override in the next step and report
  the mismatch in the task result (do NOT edit the framework's version files for this).

- [ ] **Step 2: Publish**

Run: `cd FRAMEWORK && ./gradlew publishToMavenLocal -x test` (append `-PprojectVersion=1.2.5-SNAPSHOT` only if Step 1 showed a different version and the build script reads `projectVersion`; otherwise ask how the version is set before overriding).
Then verify: `ls ~/.m2/repository/dev/simplecore/simplix/spring-boot-starter-simplix/1.2.5-SNAPSHOT/ | head`
Expected: freshly timestamped jar + pom.

---

### Task 13: smart-safety migrates onto the framework assets

**Files (APP repo):**
- Modify: every `*.java` importing the app copies (mechanical rewrite below)
- Modify: `.simplix/templates/dto/EntityDTOs.java.template`
- Delete: `packages/app-core/src/main/java/dev/accesscore/app/infra/annotation/FieldLabel.java`
- Delete: `packages/domain-core/src/main/java/dev/accesscore/domain/core/enums/LabeledEnum.java`, `LabeledEnumDeserializer.java`
- Delete: `packages/domain-core/src/main/java/dev/accesscore/domain/core/util/AbstractMessageResolver.java`, `EntityMessageResolver.java`, `EnumMessageResolver.java`
- Delete: `modules/common-dev/.../controller/I18nMessagesDevRestController.java`, `.../service/I18nMessagesService.java`, `.../dto/{EntityMessages,EnumMessages,I18nMessagesResponse,LocalizedString}.java`
- Modify: the dev/local profile config (yml) to enable the two endpoints

- [ ] **Step 0: Record what the other session is holding**

Another session edits this repo concurrently. Snapshot its uncommitted work FIRST so you can prove
afterwards that you neither swept it into your commit nor clobbered it:

```bash
cd APP
git status --porcelain > /tmp/app-dirty-before.txt
cat /tmp/app-dirty-before.txt
```

Then list which of those files your rewrite is about to touch:

```bash
git grep -l "accesscore.app.infra.annotation.FieldLabel\|accesscore.domain.core.enums.LabeledEnum\|domain.core.util.EnumMessageResolver\|domain.core.util.EntityMessageResolver\|domain.core.util.AbstractMessageResolver" -- '*.java' > /tmp/app-rewrite-targets.txt
awk '{print $2}' /tmp/app-dirty-before.txt | grep '\.java$' | sed 's|^smart-safety-backend/||' > /tmp/app-theirs.txt
comm -12 <(sort /tmp/app-rewrite-targets.txt) <(sort /tmp/app-theirs.txt)
```

Any path printed by that `comm` is a file the other session has uncommitted edits in AND your
rewrite will modify. The user has decided to proceed regardless — so proceed, but **record that
list verbatim in your task report** so the overlap is visible rather than silent.

- [ ] **Step 1: Rewrite imports (mechanical)**

```bash
cd APP
git ls-files '*.java' | xargs perl -pi -e '
  s/dev\.accesscore\.app\.infra\.annotation\.FieldLabel/dev.simplecore.simplix.core.annotation.FieldLabel/g;
  s/dev\.accesscore\.domain\.core\.enums\.LabeledEnumDeserializer/dev.simplecore.simplix.core.enums.LabeledEnumDeserializer/g;
  s/dev\.accesscore\.domain\.core\.enums\.LabeledEnum/dev.simplecore.simplix.core.enums.LabeledEnum/g;
  s/dev\.accesscore\.domain\.core\.util\.AbstractMessageResolver/dev.simplecore.simplix.core.i18n.AbstractMessageResolver/g;
  s/dev\.accesscore\.domain\.core\.util\.EntityMessageResolver/dev.simplecore.simplix.core.i18n.EntityMessageResolver/g;
  s/dev\.accesscore\.domain\.core\.util\.EnumMessageResolver/dev.simplecore.simplix.core.i18n.EnumMessageResolver/g;
'
perl -pi -e 's/dev\.accesscore\.app\.infra\.annotation\.FieldLabel/dev.simplecore.simplix.core.annotation.FieldLabel/g' \
  .simplix/templates/dto/EntityDTOs.java.template
```

Then verify zero leftovers: `git grep -l "accesscore.app.infra.annotation.FieldLabel\|accesscore.domain.core.enums.LabeledEnum\|domain.core.util.EnumMessageResolver\|domain.core.util.EntityMessageResolver\|domain.core.util.AbstractMessageResolver" -- '*.java'`
Expected: only the about-to-be-deleted originals (or nothing).

- [ ] **Step 2: Delete the app copies**

```bash
cd APP
git rm packages/app-core/src/main/java/dev/accesscore/app/infra/annotation/FieldLabel.java \
       packages/domain-core/src/main/java/dev/accesscore/domain/core/enums/LabeledEnum.java \
       packages/domain-core/src/main/java/dev/accesscore/domain/core/enums/LabeledEnumDeserializer.java \
       packages/domain-core/src/main/java/dev/accesscore/domain/core/util/AbstractMessageResolver.java \
       packages/domain-core/src/main/java/dev/accesscore/domain/core/util/EntityMessageResolver.java \
       packages/domain-core/src/main/java/dev/accesscore/domain/core/util/EnumMessageResolver.java
git rm modules/common-dev/src/main/java/dev/accesscore/web/common/dev/controller/I18nMessagesDevRestController.java \
       modules/common-dev/src/main/java/dev/accesscore/web/common/dev/service/I18nMessagesService.java \
       modules/common-dev/src/main/java/dev/accesscore/web/common/dev/dto/EntityMessages.java \
       modules/common-dev/src/main/java/dev/accesscore/web/common/dev/dto/EnumMessages.java \
       modules/common-dev/src/main/java/dev/accesscore/web/common/dev/dto/I18nMessagesResponse.java \
       modules/common-dev/src/main/java/dev/accesscore/web/common/dev/dto/LocalizedString.java
```

If other classes in `common-dev` referenced the deleted service/DTOs, the compile in Step 5 will
name them — update those references to the framework packages (`dev.simplecore.simplix.web.i18n.*`)
rather than restoring the copies.

- [ ] **Step 2.5: Rename the colliding DTO**

Two distinct DTOs share the simple name `AuthSessionSearchDTO`, so SimpliX Meta's name-keyed `types`
map cannot hold both — one silently overwrites the other, and both are `@SearchableParams`
targets, so one of the two screens gets the wrong filter set. Measured: 633 DTO declarations,
632 distinct simple names. Enums are clean (139, all distinct).

| File | Fields | Action |
| --- | --- | --- |
| `modules/user-self/.../dto/CurrentUserSessionDTOs.java` | 9 | rename to `CurrentUserSessionSearchDTO` |
| `modules/common-auth/.../dto/AuthSessionDTOs.java` | 13 | leave as `AuthSessionSearchDTO` |

The user-self one is the one to move: it searches the caller's OWN sessions, so the narrower name
is also the more accurate one. Update its declaration and the two references in
`CurrentUserSessionRestController.java` (the `import` and the `@SearchableParams(...)` argument).

Verify afterwards that no simple name is claimed twice:

```bash
cd APP
git grep -ho "class [A-Za-z0-9]*DTO\b" -- '*DTOs.java' | awk '{print $2}' | sort | uniq -d
```

Expected: no output. Include the result in your task report.

- [ ] **Step 3: Template gains the required-mode convention**

In `.simplix/templates/dto/EntityDTOs.java.template`, inside the `<%= entityName %>DetailDTO`
class (line ~738), the id field and each of the four audit fields
(`createdBy`/`createdAt`/`updatedBy`/`updatedAt`, around line 805) currently carry a bare
`@Schema(description = ...)`. Change those `@Schema` annotations — in the DetailDTO section
ONLY — to include the required mode, e.g.:

```java
@Schema(description = "Created by", requiredMode = Schema.RequiredMode.REQUIRED)
```

and the DetailDTO id field's `@Schema` likewise. Do not touch the Search/Create/Update sections.

- [ ] **Step 4: Enable the endpoints in the dev profile**

Find the dev/local profile config: `ls APP/config/ APP/apps/*/src/main/resources/application*.yml 2>/dev/null`.
In the dev-profile document add:

```yaml
simplix:
  dev:
    meta:
      enabled: true
    i18n:
      enabled: true
```

If the security config's permit list for `/dev/**` (or `/api/v1/dev/**`) is path-based it already
covers the new endpoint (same prefix). Verify: `git grep -n "dev/" -- '**/SecurityConfig*.java' '**/*.yml' | grep -i permit` — if the i18n endpoint needed an explicit permit entry, mirror it for `/dev/meta/**`.

- [ ] **Step 5: Build and test the app**

Run: `cd APP && ./gradlew compileJava compileTestJava`
Expected: BUILD SUCCESSFUL. Fix any compile break by completing the import rewrite (Step 1
patterns) — never by re-creating deleted classes.

Run: `cd APP && ./gradlew test`
Expected: PASS. If a test asserted on the app's own i18n dev endpoint classes, repoint it to
`dev.simplecore.simplix.web.i18n.*`.

- [ ] **Step 6: Commit (APP repo — ONLY the paths this task changed)**

**`git add -A` is forbidden here.** The repository root is shared with the frontend AND another
session is committing to this same branch while you work; `-A` would stage their uncommitted work
under your message. Stage the exact files this task touched, by name:

```bash
cd APP
# the rewritten sources: exactly the intersection of your rewrite targets and what is now dirty
git add $(comm -12 <(sort /tmp/app-rewrite-targets.txt | sed 's|^|smart-safety-backend/|') \
                   <(git status --porcelain | awk '{print $2}' | sort))
# the deletions from Step 2 are already staged by `git rm`
# the template and the profile config you edited in Steps 3-4:
git add smart-safety-backend/.simplix/templates/dto/EntityDTOs.java.template
git add <the dev-profile yml you edited in Step 4>
```

Then inspect before committing:

```bash
git diff --cached --stat
git status --porcelain > /tmp/app-dirty-after.txt
diff /tmp/app-dirty-before.txt /tmp/app-dirty-after.txt
```

Two rules, both hard:
- Every staged path starts with `smart-safety-backend/` and is one this task edited. Anything
  else — especially anything under `smart-safety-frontend/` or in the `data-io` module —
  gets unstaged (`git restore --staged <path>`) and reported.
- Any file in `/tmp/app-dirty-before.txt` that is NOT one of your rewrite targets must still be
  unstaged and still dirty afterwards. If one vanished, you clobbered someone's work — STOP and
  report it instead of committing.

```bash
git commit -m "refactor: adopt framework FieldLabel, LabeledEnum, resolvers and dev endpoints"
```

- [ ] **Step 7: Patch the generator's upstream sample template (separate repo)**

The same two changes land in the generator's shipped sample, so a future `yo simplix` in ANY
project emits the framework import and the required-mode convention:

```bash
GEN=/Users/taehwan/Workspace/simplix/simplix-generator
perl -pi -e 's/dev\.accesscore\.app\.infra\.annotation\.FieldLabel/dev.simplecore.simplix.core.annotation.FieldLabel/g' \
  "$GEN/sample/.simplix/templates/dto/EntityDTOs.java.template"
```

Then apply the same DetailDTO `requiredMode` edits as Step 3 to that file (id field + four audit
fields in the DetailDTO section only). Commit in that repo:

```bash
cd "$GEN"
git add sample/.simplix/templates/dto/EntityDTOs.java.template
git commit -m "feat: emit framework FieldLabel import and required-mode on detail DTOs"
```

---

### Task 14: Boot, capture, and verify SimpliX Meta

- [ ] **Step 1: Start the backend with the dev profile**

Use the app's own run script/README command (check `APP/README.md` or `APP/build.sh`; typically
`./gradlew :apps:<app>:bootRun` with the dev profile). Read the actual port from startup logs
(expected 8082 — the frontend config points at `http://localhost:8082`).

- [ ] **Step 2: Capture SimpliX Meta**

```bash
curl -sf "http://localhost:8082/api/v1/dev/meta/dto" -o /tmp/meta-envelope.json
python3 -c "import json;d=json.load(open('/tmp/meta-envelope.json'));json.dump(d['body'],open('/tmp/meta.json','w'),ensure_ascii=False,indent=2)"
```

(The response arrives wrapped in `SimpliXApiResponse`; SimpliX Meta is its `body`.)

- [ ] **Step 3: Assert the four claims the whole design rests on**

```bash
python3 - <<'EOF'
import json
ir = json.load(open('/tmp/meta.json'))
assert ir['version'] == 1

# 1. Inheritance survives: some type extends another and carries only its own fields.
extending = {n: t for n, t in ir['types'].items() if t.get('extends')}
assert extending, 'no type carries extends — inheritance was lost'

# 2. Validation survives: a notBlank and a maxLength exist somewhere.
kinds = {c['kind'] for t in ir['types'].values() for f in t['fields'] for c in (f.get('constraints') or [])}
assert 'notBlank' in kinds and ('maxLength' in kinds or 'max' in kinds), f'constraints thin: {kinds}'

# 3. Access is structured: permission entries dominate, raw expressions are the exception.
access = [op['access']['kind'] for op in ir['operations']]
assert access.count('permission') > 100, f'permission count suspicious: {access.count("permission")}'

# 4. Labeled enums carry the value/label contract with label keys.
labeled = [e for e in ir['enums'].values() if e['labeled']]
assert len(labeled) > 100, f'labeled enums suspicious: {len(labeled)}'
assert all(v.get('labelKey') for e in labeled for v in e['values'])

print('operations', len(ir['operations']), '| types', len(ir['types']), '| enums', len(ir['enums']))
print('SimpliX Meta OK')
EOF
```

Expected: `SimpliX Meta OK` with plausible counts (≥ 500 operations, ≥ 400 types, ≥ 130 enums). If an
assertion fails, the corresponding builder piece (Task 8/9) missed a case — fix it there, rebuild,
republish (Task 12), restart, recapture. Do not weaken the assertion.

- [ ] **Step 4: Save SimpliX Meta where the frontend plan expects it**

```bash
cp /tmp/meta.json /Users/taehwan/Workspace/accesscore/accesscore-smart-safety/smart-safety-frontend/openapi/meta.json
```

Do not commit it yet — the frontend plan owns that decision. Stop the dev server you started.

- [ ] **Step 5: Report**

The task result must state: operation/type/enum counts, every deviation taken (version mismatch,
SPI signature divergence noted in Task 9, any compile fixes in Task 13), and the path of the
captured SimpliX Meta. The frontend implementation plan is written against this capture.
