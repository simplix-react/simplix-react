[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/headless](../README.md) / OrvalGetResultLike

# Interface: OrvalGetResultLike

Defined in: [adapt-orval-get.ts:7](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-get.ts#L7)

Minimal shape required of an Orval-generated single-resource query result:
only `data` is needed at the boundary. Orval types `data` as the raw HTTP
envelope (`{ data, status, headers }`), but the boot mutator unwraps it at
runtime so `data` is the plain entity DTO. This adapter bridges that gap.

## Properties

### data

> **data**: `unknown`

Defined in: [adapt-orval-get.ts:8](https://github.com/simplix-react/simplix-react/blob/main/adapt-orval-get.ts#L8)
