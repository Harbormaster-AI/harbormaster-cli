const test = require('node:test');
const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

test('Test a list of models', async () => {

    process.env.HM_TEST = "true";
    const { stdout } = await execFileAsync(
      'node',
         [
         'bin/hm.js',
        "model",
        "list",
        "--output",
        "json"
        ]
    );


    const result = JSON.parse(stdout);

    assert.ok(Array.isArray(result));
    assert.ok(result.length > 0);

    for (const model of result) {
        assert.ok(model.identity.id);
        assert.ok(model.identity.name);
    }

    process.env.HM_TEST = "false";
});

test('List of model categories', async () => {

    process.env.HM_TEST = "true";
    const { stdout } = await execFileAsync(
             'node',
                [
                'bin/hm.js',
        "model",
        "categories"
        ]
    );


    assert.ok(stdout.length > 0);

    process.env.HM_TEST = "false";
});

test('List of model categories', async () => {

    process.env.HM_TEST = "true";
    const { stdout } = await execFileAsync(
     'node',
        [
        'bin/hm.js',
        "model",
        "industries"
        ]
    );


    assert.ok(stdout.length > 0);

    process.env.HM_TEST = "false";
});

