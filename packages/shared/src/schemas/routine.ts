import {z} from 'zod'
import type {Constraint} from './constraint'
import {constraintSchema} from './constraint'

export const stepTypeSchema = z.enum([
	'action',
	'wait',
	'conditional',
	'subroutine'
])

export const ruleSchema = z.object({
	id: z.string(),
	name: z.string().optional(),
	when: z.record(z.unknown()),
	thenDo: z.record(z.unknown())
})

export type StepType = z.infer<typeof stepTypeSchema>
export type Rule = z.infer<typeof ruleSchema>

export type Step = {
	id: string
	title: string
	type: StepType
	durationMinutes?: number
	children?: Step[]
	constraints?: Constraint[]
}

export const stepSchema: z.ZodType<Step> = z.lazy(() =>
	z.object({
		id: z.string(),
		title: z.string(),
		type: stepTypeSchema,
		durationMinutes: z.number().int().positive().optional(),
		children: z.array(stepSchema).optional(),
		constraints: z.array(constraintSchema).optional()
	})
)

export const routineVariantSchema = z.enum(['full', 'compressed', 'minimum'])

export const routineSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().optional(),
	variants: z.array(routineVariantSchema).optional(),
	steps: z.array(stepSchema),
	rules: z.array(ruleSchema).optional()
})

export type RoutineVariant = z.infer<typeof routineVariantSchema>
export type Routine = z.infer<typeof routineSchema>
