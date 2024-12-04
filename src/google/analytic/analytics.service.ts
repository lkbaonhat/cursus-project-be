import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

@Injectable()
export class AnalyticsService {
    private client: BetaAnalyticsDataClient;

    constructor(private readonly configService: ConfigService) {
        this.client = new BetaAnalyticsDataClient({
            keyFilename: this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_PATH'),
        });
    }

    async getVisitorsByMonth() {
        const propertyId = this.configService.get<string>('GOOGLE_ANALYTICS_PROPERTY_ID');


        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);

        const formatDate = (date: Date) =>
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        const startDate = formatDate(startOfYear);
        const endDate = formatDate(endOfYear);

        // Gọi Google Analytics API
        const [response] = await this.client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'activeUsers' },
                { name: 'newUsers' },
            ],
            dimensions: [{ name: 'month' }], // Tổng hợp theo tháng
        });

        // Chuẩn hóa dữ liệu
        const data = Array.from({ length: 12 }, (_, i) => ({
            month: String(i + 1).padStart(2, '0'),
            activeUsers: 0,
            newUsers: 0,
            returningUsers: 0,
        }));

        response.rows?.forEach((row) => {
            const monthIndex = parseInt(row.dimensionValues[0].value, 10) - 1;
            data[monthIndex].activeUsers = parseInt(row.metricValues[0].value, 10);
            data[monthIndex].newUsers = parseInt(row.metricValues[1].value, 10);
            data[monthIndex].returningUsers =
                Math.max(0, parseInt(row.metricValues[0].value, 10) - parseInt(row.metricValues[1].value, 10));
        });

        return data;
    }

}
