import {z} from 'zod'

export const constraintKindSchema = z.enum(['hard', 'soft', 'elastic'])

export const constraintSchema = z.object({
	id: z.string(),
	kind: constraintKindSchema,
	title: z.string(),
	description: z.string().optional()
})

export type ConstraintKind = z.infer<typeof constraintKindSchema>
export type Constraint = z.infer<typeof constraintSchema>
