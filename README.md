# gemini-faildump

Plugin collects all test fails and saves them in file `faildump.json`. Screenshots are encoded in Base64.
If some image differences are reproduced in all test runs (initial run plus all retries), such fails are considered as
normal and not included in the final report.

## Installation

`npm gemini-faildump`

## Configuration

Set the configuration to your `.gemini.yml`

```yml
system:
  plugins:
    gemini-faildump:
```
