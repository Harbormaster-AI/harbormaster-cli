const test = require('node:test');
const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

test('Validate version', async () => {

    process.env.HM_TEST = "true";
    const { stdout } = await execFileAsync(
                "node",
                [
        'bin/hm.js',
        "version"
        ]
    );


    assert.ok(stdout.length > 0);
    process.env.HM_TEST = "false";
});


test('Show the state of the configuration', async () => {

    process.env.HM_TEST = "true";
    const { stdout } = await execFileAsync(
         'node',
        [
            'bin/hm.js',
            "config",
            "show"
        ]
    );

    assert.ok(stdout.length > 0);
    process.env.HM_TEST = "false";
});

test('Show the state of the configuration', async () => {

    process.env.HM_TEST = "true";
    const { stdout } = await execFileAsync(
     'node',
        [
            'bin/hm.js',
            "config",
            "set",
            "--output",
            "json"
        ]

    );

    assert.ok(stdout.length == 0);
    process.env.HM_TEST = "false";
});

