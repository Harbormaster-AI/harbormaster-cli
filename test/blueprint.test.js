const test = require('node:test');
const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

test('Blueprint list', async () => {

    process.env.HM_TEST = "true";
    const { stdout } = await execFileAsync(
        'node',
        [
            'bin/hm.js',
            'blueprint',
            'list',
            '--output',
            'json'
        ]
    );

    const result = JSON.parse(stdout);

    assert.ok(Array.isArray(result));
    assert.ok(result.length > 0);

    for (const blueprint of result) {
        assert.ok(blueprint.identity.id);
        assert.ok(blueprint.identity.name);
    }

    process.env.HM_TEST = "false";
});