import app from 'flarum/forum/app';

/**
 * Data loading service for external data sources
 */
export class DataLoader {
    private static instance: DataLoader;
    
    // Loading states
    private tronscanListLoading = false;
    private linksQueueListLoading = false;
    private buttonsCustomizationListLoading = false;
    
    // Data storage
    private tronscanList: any[] | null = null;
    private linksQueueList: any[] | null = null;
    private buttonsCustomizationList: any[] | null = null;
    private linksQueuePointer = 0;

    private constructor() {}

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
     * Load Tronscan data
     * @returns {Promise<any[]>} Promise resolving to tronscan data
     */
    async loadTronscanList(): Promise<any[]> {
        if (this.tronscanListLoading) {
            return this.waitForTronscanList();
        }

        if (this.tronscanList !== null) {
            return this.tronscanList;
        }

        this.tronscanListLoading = true;
        
        try {
            const results = await app.store.find("syncTronscanList").catch(() => []);
            this.tronscanList = [];
            if (Array.isArray(results)) {
                this.tronscanList.push(...results);
            }
            return this.tronscanList;
        } catch (error) {
            console.error('Failed to load tronscan list:', error);
            this.tronscanList = [];
            return this.tronscanList;
        } finally {
            this.tronscanListLoading = false;
        }
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
            const results = await app.store.find("buttonsCustomizationList").catch(() => []);
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
            const results = await app.store.find("linksQueueList").catch(() => []);
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
     * @returns {Promise<{tronscan: any[], buttons: any[], links: any[]}>} Promise resolving to all data
     */
    async loadAllData(): Promise<{tronscan: any[], buttons: any[], links: any[]}> {
        const [tronscan, buttons, links] = await Promise.all([
            this.loadTronscanList(),
            this.loadButtonsCustomizationList(),
            this.loadLinksQueueList()
        ]);

        return { tronscan, buttons, links };
    }

    // Getters for data
    getTronscanList(): any[] | null {
        return this.tronscanList;
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
    private async waitForTronscanList(): Promise<any[]> {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (!this.tronscanListLoading && this.tronscanList !== null) {
                    clearInterval(checkInterval);
                    resolve(this.tronscanList);
                }
            }, 100);
        });
    }

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
