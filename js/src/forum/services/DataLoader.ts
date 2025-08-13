import app from 'flarum/forum/app';
import { defaultConfig } from '../../common/config';

/**
 * Data loading service for external data sources
 */
export class DataLoader {
    private static instance: DataLoader;

    // Loading states
    private linksQueueListLoading = false;
    private buttonsCustomizationListLoading = false;

    // Data storage
    private linksQueueList: any[] | null = null;
    private buttonsCustomizationList: any[] | null = null;
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
     * Load buttons customization data
     * @returns {Promise<any[]>} Promise resolving to buttons customization data
     */
    async loadButtonsCustomizationList(): Promise<any[]> {
        if (this.buttonsCustomizationListLoading) {
            return this.waitForButtonsCustomizationList();
        }

        if (this.buttonsCustomizationList !== null) {
            return this.buttonsCustomizationList;
        }

        this.buttonsCustomizationListLoading = true;

        try {
            const results = await app.store.find(defaultConfig.data.apiResources.buttonsCustomizationList).catch(() => []);
            this.buttonsCustomizationList = [];
            if (Array.isArray(results)) {
                this.buttonsCustomizationList.push(...results);
            }
            return this.buttonsCustomizationList;
        } catch (error) {
            console.error('Failed to load buttons customization list:', error);
            this.buttonsCustomizationList = [];
            return this.buttonsCustomizationList;
        } finally {
            this.buttonsCustomizationListLoading = false;
        }
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
        } catch (error) {
            console.error('Failed to load links queue list:', error);
            this.linksQueueList = [];
            return this.linksQueueList;
        } finally {
            this.linksQueueListLoading = false;
        }
    }

    /**
     * Load all data sources
     * @returns {Promise<{buttons: any[], links: any[]}>} Promise resolving to all data
     */
    async loadAllData(): Promise<{ buttons: any[], links: any[] }> {
        const [buttons, links] = await Promise.all([
            this.loadButtonsCustomizationList(),
            this.loadLinksQueueList()
        ]);

        return { buttons, links };
    }

    getButtonsCustomizationList(): any[] | null {
        return this.buttonsCustomizationList;
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

    private async waitForButtonsCustomizationList(): Promise<any[]> {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (!this.buttonsCustomizationListLoading && this.buttonsCustomizationList !== null) {
                    clearInterval(checkInterval);
                    resolve(this.buttonsCustomizationList);
                }
            }, 100);
        });
    }

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
