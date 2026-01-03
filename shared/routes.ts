import { z } from 'zod';
import { locations, recommendations, locationSnapshots, insightsDaily, scoreWeeks, insertLocationSchema, insertRecommendationSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    user: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.object({
          id: z.number(),
          email: z.string(),
          name: z.string().nullable(),
          picture: z.string().nullable(),
        }).nullable(),
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
  locations: {
    list: {
      method: 'GET' as const,
      path: '/api/locations',
      responses: {
        200: z.array(z.custom<typeof locations.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/locations/:id',
      responses: {
        200: z.custom<typeof locations.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    sync: {
      method: 'POST' as const,
      path: '/api/locations/:id/sync',
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    score: {
      method: 'GET' as const,
      path: '/api/locations/:id/score', // Latest score
      responses: {
        200: z.custom<typeof scoreWeeks.$inferSelect>().nullable(),
        404: errorSchemas.notFound,
      },
    },
    recommendations: {
      method: 'GET' as const,
      path: '/api/locations/:id/recommendations',
      responses: {
        200: z.array(z.custom<typeof recommendations.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    },
    insights: {
      method: 'GET' as const,
      path: '/api/locations/:id/insights',
      responses: {
        200: z.array(z.custom<typeof insightsDaily.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    },
  },
  recommendations: {
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/recommendations/:id/status',
      input: z.object({ status: z.enum(['open', 'done', 'snoozed']) }),
      responses: {
        200: z.custom<typeof recommendations.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
