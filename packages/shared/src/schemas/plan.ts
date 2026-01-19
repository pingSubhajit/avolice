import {z} from 'zod'

export const planItemStatusSchema = z.enum([
	'scheduled',
	'in_progress',
	'completed',
	'skipped',
	'delayed'
])

export const planItemSchema = z.object({
	id: z.string(),
	title: z.string(),
	start: z.string(),
	end: z.string(),
	status: planItemStatusSchema,
	routineId: z.string().optional(),
	stepId: z.string().optional()
})

export const planRevisionSchema = z.object({
	id: z.string(),
	date: z.string(),
	items: z.array(planItemSchema),
	createdAt: z.string(),
	rationale: z.string().optional()
})

export const planDiffSchema = z.object({
	before: z.array(planItemSchema),
	after: z.array(planItemSchema),
	reason: z.string().optional()
})

export type PlanItemStatus = z.infer<typeof planItemStatusSchema>
export type PlanItem = z.infer<typeof planItemSchema>
export type PlanRevision = z.infer<typeof planRevisionSchema>
export type PlanDiff = z.infer<typeof planDiffSchema>
