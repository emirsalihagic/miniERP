import { z } from 'zod';

export const TOOL_SCHEMAS = [
  {
    name: 'searchProducts',
    description: 'Search products by name or SKU',
    parameters: z.object({
      query: z.string(),
      limit: z.number().optional()
    })
  },
  {
    name: 'searchClients',
    description: 'Search clients by name or email',
    parameters: z.object({
      query: z.string().optional(),
      email: z.string().optional(),
      limit: z.number().optional()
    })
  },
  {
    name: 'addToCart',
    description: 'Add items to cart (requires confirmation)',
    parameters: z.object({
      clientId: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number()
      }))
    }),
    requiresConfirmation: true
  },
  {
    name: 'createOrderDirect',
    description: 'Create order directly (requires confirmation)',
    parameters: z.object({
      clientId: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number()
      })),
      note: z.string().optional()
    }),
    requiresConfirmation: true
  },
  {
    name: 'getOrderStats',
    description: 'Get order statistics',
    parameters: z.object({
      from: z.string(),
      to: z.string(),
      groupBy: z.enum(['day', 'week', 'month']),
      clientId: z.string().optional(),
      status: z.array(z.string()).optional()
    })
  },
  {
    name: 'getUserPreferences',
    description: 'Get current user preferences (theme, language, currency, etc.)',
    parameters: z.object({})
  },
  {
    name: 'updateUserPreferences',
    description: 'Update user preferences (requires confirmation)',
    parameters: z.object({
      theme: z.enum(['LIGHT', 'DARK', 'AUTO']).optional(),
      language: z.enum(['EN', 'BS', 'HR', 'SR']).optional(),
      currency: z.enum(['BAM', 'EUR', 'USD', 'GBP', 'CHF']).optional(),
      dateFormat: z.enum(['DD_MM_YYYY', 'MM_DD_YYYY', 'YYYY_MM_DD', 'DD_MMM_YYYY', 'MMM_DD_YYYY']).optional(),
      timeFormat: z.enum(['HOUR_12', 'HOUR_24']).optional(),
      timezone: z.string().optional(),
      emailNotifications: z.boolean().optional(),
      autoSaveForms: z.boolean().optional()
    }),
    requiresConfirmation: true
  }
];

export type ToolSchema = typeof TOOL_SCHEMAS[0];
