# antlr v4 parser

- follow [these instructions](https://github.com/antlr/antlr4/blob/master/doc/getting-started.md) to get environment set up
- build with `javac Hello*.java`
- run with `grun Hello -r gui`
- enter `hello <world><newline>`, `^D` to generate, `^C` to exit

for cpp replace broken gen with this:
```typescript
if (!_localctx._val || !_localctx._val.text || _localctx._val.text !== '0') {
  throw new InputMismatchException(this);
}
```
