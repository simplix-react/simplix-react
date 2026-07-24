[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / OrvalGetResultLike

# Interface: OrvalGetResultLike

Defined in: [packages/headless/dist/index.d.ts:148](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L148)

Minimal shape required of an Orval-generated single-resource query result:
only `data` is needed at the boundary. Orval types `data` as the raw HTTP
envelope (`{ data, status, headers }`), but the boot mutator unwraps it at
runtime so `data` is the plain entity DTO. This adapter bridges that gap.

## Properties

### data

> **data**: `unknown`

Defined in: [packages/headless/dist/index.d.ts:149](https://github.com/simplix-react/simplix-react/blob/main/packages/headless/dist/index.d.ts#L149)
