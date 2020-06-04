const { exec } = require('child_process');

function cli(args, cwd) {
    return new Promise(r => {
        exec(`node runnerman.js ${args.join(' ')}`, { cwd }, (error, stdout, stderr) => {
            r({ code: error && error.code ? error.code : 0, error, stdout, stderr });
        });
    });
}

describe('mock Test -> Cli', () => {
    it('1', async () => {
        const result = await cli(['-c'], './bin/');
        expect(result.code).toBe(1);
        expect(result.stderr).toMatch("error: option '-c, --collection <type>' argument missing");
    });

    it('2', async () => {
        const result = await cli(['-c', '""'], './bin/');
        expect(result.code).toBe(0);
    });

    it('3', async () => {
        const result = await cli(['-c', 'runnerman-collection.postman_collection.json', '-s', 'suites/'], './bin/');
        expect(result.code).toBe(0);
    });
});
