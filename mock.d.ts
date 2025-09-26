declare module './mock.js' {
  export function init(): void;
  export function mockApi(path: string, callfn: Function, data?: any, encrypt?: boolean, noAuth?: boolean, delayTime?: number): void;
  export function setMockData(path: string, data: any): void;
  export function removeMockData(path: string): void;
  export function getAllMockData(): Record<string, any>;
  
  const mock: {
    init: typeof init;
    mockApi: typeof mockApi;
    setMockData: typeof setMockData;
    removeMockData: typeof removeMockData;
    getAllMockData: typeof getAllMockData;
  };
  
  export default mock;
}