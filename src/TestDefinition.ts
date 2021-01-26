export interface ITest {
    testName: string;
    filePath: string;
    startLine: number;
}

export interface IFixture extends ITest {
    testChildren: Array<ITest>;
}
