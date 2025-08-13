import app from 'flarum/forum/app';
import { defaultConfig } from '../../common/config';

/**
 * Data loading service for external data sources
 */
export class DataLoader {
    private static instance: DataLoader;

    // Loading states
    private linksQueueListLoading = false;

    // Data storage
    private linksQueueList: any[] | null = null;
    private linksQueuePointer = 0;

    private constructor() { }

    /**
     * Get singleton instance
     */
    static getInstance(): DataLoader {
        if (!DataLoader.instance) {
            DataLoader.instance = new DataLoader();
        }
        return DataLoader.instance;
    }





    /**
     * Load links queue data
     * @returns {Promise<any[]>} Promise resolving to links queue data
     */
    async loadLinksQueueList(): Promise<any[]> {
        if (this.linksQueueListLoading) {
            return this.waitForLinksQueueList();
        }

        if (this.linksQueueList !== null) {
            return this.linksQueueList;
        }

        this.linksQueueListLoading = true;

        try {
            const results = await app.store.find(defaultConfig.data.apiResources.linksQueueList).catch(() => []);
            this.linksQueueList = [];
            if (Array.isArray(results)) {
                this.linksQueueList.push(...results);
            }
            return this.linksQueueList;
        } catch {
            this.linksQueueList = [];
            return this.linksQueueList;
        } finally {
            this.linksQueueListLoading = false;
        }
    }

    /**
     * Load all data sources
     * @returns {Promise<{links: any[]}>} Promise resolving to all data
     */
    async loadAllData(): Promise<{ links: any[] }> {
        const links = await this.loadLinksQueueList();
        return { links };
    }

    getLinksQueueList(): any[] | null {
        return this.linksQueueList;
    }

    getLinksQueuePointer(): number {
        return this.linksQueuePointer;
    }

    setLinksQueuePointer(pointer: number): void {
        this.linksQueuePointer = Math.max(0, pointer);
    }

    // Helper methods for waiting

    private async waitForLinksQueueList(): Promise<any[]> {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (!this.linksQueueListLoading && this.linksQueueList !== null) {
                    clearInterval(checkInterval);
                    resolve(this.linksQueueList);
                }
            }, 100);
        });
    }
}
