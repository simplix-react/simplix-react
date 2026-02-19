[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / CrudErrorBoundary

# Class: CrudErrorBoundary

Defined in: [packages/ui/src/crud/shared/error-boundary.tsx:22](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/error-boundary.tsx#L22)

Error boundary for CRUD components.
Catches render errors and displays a default fallback with retry,
or a custom fallback ReactNode/render function.

## Extends

- `Component`\<[`CrudErrorBoundaryProps`](../interfaces/CrudErrorBoundaryProps.md), [`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)\>

## Constructors

### Constructor

> **new CrudErrorBoundary**(`props`): `CrudErrorBoundary`

Defined in: [packages/ui/src/crud/shared/error-boundary.tsx:26](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/error-boundary.tsx#L26)

#### Parameters

##### props

[`CrudErrorBoundaryProps`](../interfaces/CrudErrorBoundaryProps.md)

#### Returns

`CrudErrorBoundary`

#### Overrides

`Component< CrudErrorBoundaryProps, ErrorBoundaryState >.constructor`

## Properties

### context

> **context**: `unknown`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:947](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L947)

If using React Context, re-declare this in your class to be the
`React.ContextType` of your `static contextType`.
Should be used with type annotation or static contextType.

#### Example

```ts
static contextType = MyContext
// For TS pre-3.7:
context!: React.ContextType<typeof MyContext>
// For TS 3.7 and above:
declare context: React.ContextType<typeof MyContext>
```

#### See

[React Docs](https://react.dev/reference/react/Component#context)

#### Inherited from

`Component.context`

***

### props

> `readonly` **props**: `Readonly`\<`P`\>

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:971](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L971)

#### Inherited from

`Component.props`

***

### state

> **state**: `Readonly`\<`S`\>

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:972](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L972)

#### Inherited from

`Component.state`

***

### contextType?

> `static` `optional` **contextType**: `Context`\<`any`\>

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:923](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L923)

If set, `this.context` will be set at runtime to the current value of the given Context.

#### Example

```ts
type MyContext = number
const Ctx = React.createContext<MyContext>(0)

class Foo extends React.Component {
  static contextType = Ctx
  context!: React.ContextType<typeof Ctx>
  render () {
    return <>My context's value: {this.context}</>;
  }
}
```

#### See

[https://react.dev/reference/react/Component#static-contexttype](https://react.dev/reference/react/Component#static-contexttype)

#### Inherited from

`Component.contextType`

***

### ~~propTypes?~~

> `static` `optional` **propTypes**: `any`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:929](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L929)

Ignored by React.

#### Deprecated

Only kept in types for backwards compatibility. Will be removed in a future major release.

#### Inherited from

`Component.propTypes`

## Methods

### componentDidCatch()

> **componentDidCatch**(`error`, `errorInfo`): `void`

Defined in: [packages/ui/src/crud/shared/error-boundary.tsx:35](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/error-boundary.tsx#L35)

Catches exceptions generated in descendant components. Unhandled exceptions will cause
the entire component tree to unmount.

#### Parameters

##### error

`Error`

##### errorInfo

`ErrorInfo`

#### Returns

`void`

#### Overrides

`Component.componentDidCatch`

***

### componentDidMount()?

> `optional` **componentDidMount**(): `void`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:1190](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L1190)

Called immediately after a component is mounted. Setting state here will trigger re-rendering.

#### Returns

`void`

#### Inherited from

`Component.componentDidMount`

***

### componentDidUpdate()?

> `optional` **componentDidUpdate**(`prevProps`, `prevState`, `snapshot?`): `void`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:1253](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L1253)

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if [getSnapshotBeforeUpdate](#getsnapshotbeforeupdate) is present and returns non-null.

#### Parameters

##### prevProps

`Readonly`\<`P`\>

##### prevState

`Readonly`\<`S`\>

##### snapshot?

`any`

#### Returns

`void`

#### Inherited from

`Component.componentDidUpdate`

***

### ~~componentWillMount()?~~

> `optional` **componentWillMount**(): `void`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:1269](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L1269)

Called immediately before mounting occurs, and before [Component.render](https://react.dev/reference/react/Component#render).
Avoid introducing any side-effects or subscriptions in this method.

Note: the presence of [getSnapshotBeforeUpdate](#getsnapshotbeforeupdate)
or [getDerivedStateFromProps](https://react.dev/reference/react/Component#static-getderivedstatefromprops) prevents
this from being invoked.

#### Returns

`void`

#### Deprecated

16.3, use [componentDidMount](#componentdidmount) or the constructor instead; will stop working in React 17

#### See

 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state)
 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

#### Inherited from

`Component.componentWillMount`

***

### ~~componentWillReceiveProps()?~~

> `optional` **componentWillReceiveProps**(`nextProps`, `nextContext`): `void`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:1300](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L1300)

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling [Component.setState](#setstate) generally does not trigger this method.

Note: the presence of [getSnapshotBeforeUpdate](#getsnapshotbeforeupdate)
or [getDerivedStateFromProps](https://react.dev/reference/react/Component#static-getderivedstatefromprops) prevents
this from being invoked.

#### Parameters

##### nextProps

`Readonly`\<`P`\>

##### nextContext

`any`

#### Returns

`void`

#### Deprecated

16.3, use static [getDerivedStateFromProps](https://react.dev/reference/react/Component#static-getderivedstatefromprops) instead; will stop working in React 17

#### See

 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props)
 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

#### Inherited from

`Component.componentWillReceiveProps`

***

### componentWillUnmount()?

> `optional` **componentWillUnmount**(): `void`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:1206](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L1206)

Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.

#### Returns

`void`

#### Inherited from

`Component.componentWillUnmount`

***

### ~~componentWillUpdate()?~~

> `optional` **componentWillUpdate**(`nextProps`, `nextState`, `nextContext`): `void`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:1332](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L1332)

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call [Component.setState](#setstate) here.

Note: the presence of [getSnapshotBeforeUpdate](#getsnapshotbeforeupdate)
or [getDerivedStateFromProps](https://react.dev/reference/react/Component#static-getderivedstatefromprops) prevents
this from being invoked.

#### Parameters

##### nextProps

`Readonly`\<`P`\>

##### nextState

`Readonly`\<`S`\>

##### nextContext

`any`

#### Returns

`void`

#### Deprecated

16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17

#### See

 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update)
 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

#### Inherited from

`Component.componentWillUpdate`

***

### forceUpdate()

> **forceUpdate**(`callback?`): `void`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:968](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L968)

#### Parameters

##### callback?

() => `void`

#### Returns

`void`

#### Inherited from

`Component.forceUpdate`

***

### getSnapshotBeforeUpdate()?

> `optional` **getSnapshotBeforeUpdate**(`prevProps`, `prevState`): `any`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:1247](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L1247)

Runs before React applies the result of [render](https://react.dev/reference/react/Component#render) to the document, and
returns an object to be given to [componentDidUpdate](#componentdidupdate). Useful for saving
things such as scroll position before [render](https://react.dev/reference/react/Component#render) causes changes to it.

Note: the presence of this method prevents any of the deprecated
lifecycle events from running.

#### Parameters

##### prevProps

`Readonly`\<`P`\>

##### prevState

`Readonly`\<`S`\>

#### Returns

`any`

#### Inherited from

`Component.getSnapshotBeforeUpdate`

***

### render()

> **render**(): `ReactNode`

Defined in: [packages/ui/src/crud/shared/error-boundary.tsx:43](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/error-boundary.tsx#L43)

#### Returns

`ReactNode`

#### Overrides

`Component.render`

***

### setState()

> **setState**\<`K`\>(`state`, `callback?`): `void`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:963](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L963)

#### Type Parameters

##### K

`K` *extends* `"error"`

#### Parameters

##### state

[`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md) | (`prevState`, `props`) => [`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md) \| `Pick`\<[`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md), `K`\> \| `null` | `Pick`\<[`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md), `K`\> | `null`

##### callback?

() => `void`

#### Returns

`void`

#### Inherited from

`Component.setState`

***

### shouldComponentUpdate()?

> `optional` **shouldComponentUpdate**(`nextProps`, `nextState`, `nextContext`): `boolean`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:1201](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L1201)

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true.
`PureComponent` implements a shallow comparison on props and state and returns true if any
props or states have changed.

If false is returned, [Component.render](https://react.dev/reference/react/Component#render), `componentWillUpdate`
and `componentDidUpdate` will not be called.

#### Parameters

##### nextProps

`Readonly`\<`P`\>

##### nextState

`Readonly`\<`S`\>

##### nextContext

`any`

#### Returns

`boolean`

#### Inherited from

`Component.shouldComponentUpdate`

***

### ~~UNSAFE\_componentWillMount()?~~

> `optional` **UNSAFE\_componentWillMount**(): `void`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:1284](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L1284)

Called immediately before mounting occurs, and before [Component.render](https://react.dev/reference/react/Component#render).
Avoid introducing any side-effects or subscriptions in this method.

This method will not stop working in React 17.

Note: the presence of [getSnapshotBeforeUpdate](#getsnapshotbeforeupdate)
or [getDerivedStateFromProps](https://react.dev/reference/react/Component#static-getderivedstatefromprops) prevents
this from being invoked.

#### Returns

`void`

#### Deprecated

16.3, use [componentDidMount](#componentdidmount) or the constructor instead

#### See

 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state)
 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

#### Inherited from

`Component.UNSAFE_componentWillMount`

***

### ~~UNSAFE\_componentWillReceiveProps()?~~

> `optional` **UNSAFE\_componentWillReceiveProps**(`nextProps`, `nextContext`): `void`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:1318](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L1318)

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling [Component.setState](#setstate) generally does not trigger this method.

This method will not stop working in React 17.

Note: the presence of [getSnapshotBeforeUpdate](#getsnapshotbeforeupdate)
or [getDerivedStateFromProps](https://react.dev/reference/react/Component#static-getderivedstatefromprops) prevents
this from being invoked.

#### Parameters

##### nextProps

`Readonly`\<`P`\>

##### nextContext

`any`

#### Returns

`void`

#### Deprecated

16.3, use static [getDerivedStateFromProps](https://react.dev/reference/react/Component#static-getderivedstatefromprops) instead

#### See

 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props)
 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

#### Inherited from

`Component.UNSAFE_componentWillReceiveProps`

***

### ~~UNSAFE\_componentWillUpdate()?~~

> `optional` **UNSAFE\_componentWillUpdate**(`nextProps`, `nextState`, `nextContext`): `void`

Defined in: [node\_modules/.pnpm/@types+react@19.2.13/node\_modules/@types/react/index.d.ts:1348](https://github.com/simplix-react/simplix-react/blob/main/node_modules/.pnpm/@types+react@19.2.13/node_modules/@types/react/index.d.ts#L1348)

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call [Component.setState](#setstate) here.

This method will not stop working in React 17.

Note: the presence of [getSnapshotBeforeUpdate](#getsnapshotbeforeupdate)
or [getDerivedStateFromProps](https://react.dev/reference/react/Component#static-getderivedstatefromprops) prevents
this from being invoked.

#### Parameters

##### nextProps

`Readonly`\<`P`\>

##### nextState

`Readonly`\<`S`\>

##### nextContext

`any`

#### Returns

`void`

#### Deprecated

16.3, use getSnapshotBeforeUpdate instead

#### See

 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update)
 - [https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path](https://legacy.reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path)

#### Inherited from

`Component.UNSAFE_componentWillUpdate`

***

### getDerivedStateFromError()

> `static` **getDerivedStateFromError**(`error`): [`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)

Defined in: [packages/ui/src/crud/shared/error-boundary.tsx:31](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/shared/error-boundary.tsx#L31)

#### Parameters

##### error

`Error`

#### Returns

[`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)
