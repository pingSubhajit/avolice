import {z} from 'zod'

export const executionEventTypeSchema = z.enum([
	'started',
	'completed',
	'skipped',
	'delayed'
])

export const executionEventSchema = z.object({
	id: z.string(),
	stepId: z.string(),
	type: executionEventTypeSchema,
	timestamp: z.string(),
	planItemId: z.string().optional()
})

export type ExecutionEventType = z.infer<typeof executionEventTypeSchema>
export type ExecutionEvent = z.infer<typeof executionEventSchema>
