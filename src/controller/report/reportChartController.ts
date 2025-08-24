// src/controllers/report/chartController.ts

import { Request, Response } from 'express';
import {
   getYearlyRevenueChart,
   getMonthlyRevenueChart,
   getDailyRevenueChart
} from '../../service/report/reportChartService';

export const yearlyChartController = async (req: Request, res: Response): Promise<void> => {
   try {
      const ownerId = (req as any).user.id; // Adjust based on your auth middleware
      if (!ownerId) {
         res.status(401).json({ error: 'Unauthorized' });
         return;
      }

      const { years } = req.query;

      let yearList: number[];
      if (!years) {
         // Default: last 3 years
         const currentYear = new Date().getFullYear();
         yearList = [ currentYear - 2, currentYear - 1, currentYear ];
      } else if (typeof years === 'string') {
         yearList = years.split(',').map(y => {
            const num = parseInt(y.trim(), 10);
            if (isNaN(num) || num < 1970 || num > 9999) {
               throw new Error(`Invalid year: ${y}`);
            }
            return num;
         });
      } else {
         res.status(400).json({ error: 'Years must be a comma-separated list of numbers' });
         return;
      }

      const chartData = await getYearlyRevenueChart(ownerId, yearList);

      res.status(200).json({
         type: 'yearly',
         data: chartData
      });
   } catch (error: any) {
      console.error('Error in yearlyChartController:', error);
      res.status(500).json({
         error: 'Failed to generate yearly revenue chart',
         details: error.message
      });
   }
};

export const monthlyChartController = async (req: Request, res: Response): Promise<void> => {
   try {
      const ownerId = (req as any).user.id;
      if (!ownerId) {
         res.status(401).json({ error: 'Unauthorized' });
         return;
      }

      const { year } = req.query;
      let targetYear = new Date().getFullYear();

      if (year) {
         const y = parseInt(year as string, 10);
         if (isNaN(y) || y < 1970 || y > 9999) {
            res.status(400).json({ error: 'Invalid year' });
            return;
         }
         targetYear = y;
      }

      const chartData = await getMonthlyRevenueChart(ownerId, targetYear);

      res.status(200).json({
         type: 'monthly',
         year: targetYear,
         data: chartData
      });
   } catch (error: any) {
      console.error('Error in monthlyChartController:', error);
      res.status(500).json({
         error: 'Failed to generate monthly revenue chart',
         details: error.message
      });
   }
};

export const dailyChartController = async (req: Request, res: Response): Promise<void> => {
   try {
      const ownerId = (req as any).user.id;
      if (!ownerId) {
         res.status(401).json({ error: 'Unauthorized' });
         return;
      }

      const { days } = req.query;
      let dayCount = 30;

      if (days) {
         const d = parseInt(days as string, 10);
         if (isNaN(d) || d < 1 || d > 90) {
            res.status(400).json({ error: 'Days must be between 1 and 90' });
            return;
         }
         dayCount = d;
      }

      const chartData = await getDailyRevenueChart(ownerId, dayCount);

      res.status(200).json({
         type: 'daily',
         days: dayCount,
         data: chartData
      });
   } catch (error: any) {
      console.error('Error in dailyChartController:', error);
      res.status(500).json({
         error: 'Failed to generate daily revenue chart',
         details: error.message
      });
   }
};
