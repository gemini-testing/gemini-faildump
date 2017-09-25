# gemini-faildump

Plugin collects all test fails and saves them in file `faildump.json`. Screenshots are encoded in Base64.
If some image differences are reproduced in all test runs (initial run plus all retries), such fails are considered as
normal and not included in the final report.

## Installation

`npm i gemini-faildump`

## Configuration

Set the configuration to your `.gemini.js`

```js
module.exports = {
    system: {
        plugins: {
            'gemini-faildump': {
                enabled: true,
                light: true
            }
        }
    }
};
```

## Options

 - `enabled` - switch on/off the plugin; the plugin is switched on by default.
 - `light` - switch on this option to avoid adding base64 image to report.
