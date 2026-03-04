import { z } from "zod";

const sortObjectSchema = z.object({
  empty: z.boolean(),
  sorted: z.boolean(),
  unsorted: z.boolean(),
}).optional();

export const springPageSchema = z.object({
  totalPages: z.number(),
  totalElements: z.number(),
  first: z.boolean(),
  last: z.boolean(),
  size: z.number(),
  number: z.number(),
  numberOfElements: z.number(),
  empty: z.boolean(),
  sort: sortObjectSchema,
  pageable: z.object({
    offset: z.number(),
    sort: sortObjectSchema,
    paged: z.boolean(),
    unpaged: z.boolean(),
    pageNumber: z.number(),
    pageSize: z.number(),
  }).optional(),
});

export function pageOf<T extends z.ZodType>(itemSchema: T) {
  return springPageSchema.extend({
    content: z.array(itemSchema),
  });
}

export type SpringPage<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
};
