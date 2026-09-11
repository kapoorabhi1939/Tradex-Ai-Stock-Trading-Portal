import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import path from "node:path";

test("server adapter groups and deduplicates quotes, separates history cache, and refuses missing configuration", () => {
  const moduleUrl = pathToFileURL(
    path.resolve("lib/market-data/twelve-data.ts"),
  ).href;
  const code = [
    'import assert from "node:assert/strict";',
    'import {mkdtempSync,rmSync} from "node:fs";',
    'import {tmpdir} from "node:os";',
    'import path from "node:path";',
    'const original=process.cwd(); const root=mkdtempSync(path.join(tmpdir(),"tradex-adapter-test-"));',
    'process.env.TWELVE_DATA_API_KEY="unit-test-only"; process.env.NODE_ENV="production";',
    'let calls=[]; globalThis.fetch=async (input)=>{const url=new URL(input);calls.push(url.pathname); const quote=s=>({symbol:s,name:s,close:"110",previous_close:"100",timestamp:1789047000,currency:"USD"});',
    'if(url.pathname==="/quote"){const symbols=url.searchParams.get("symbol").split(",");return Response.json(symbols.length===1?quote(symbols[0]):Object.fromEntries(symbols.map(s=>[s,quote(s)])));}',
    'if(url.pathname==="/time_series")return Response.json({values:[{datetime:"2026-09-10",open:"100",high:"112",low:"99",close:"110"}]}); throw Error("Unexpected endpoint");};',
    "process.chdir(root);const {twelveData}=await import(" +
      JSON.stringify(moduleUrl) +
      ");",
    'try { const [a,b]=await Promise.all([twelveData.quotes([" aapl ","AAPL","MSFT"]),twelveData.quotes(["AAPL"])]); assert.equal(a.AAPL.data.price,110);assert.equal(b.AAPL.data.price,110);assert.equal(Object.keys(a).length,2);assert.deepEqual(calls,["/quote"]);',
    'await twelveData.quotes(["AAPL"]);await twelveData.history("AAPL");await twelveData.history("AAPL");assert.deepEqual(calls,["/quote","/time_series"]);',
    'delete process.env.TWELVE_DATA_API_KEY;const missing=await twelveData.quotes(["AAPL"]);assert.equal(missing.AAPL.data,null);assert.ok(missing.AAPL.error);assert.equal(calls.length,2);',
    '} finally {process.chdir(original);if(path.dirname(root)!==path.resolve(tmpdir())||!path.basename(root).startsWith("tradex-adapter-test-"))throw Error("Unsafe cleanup");rmSync(root,{recursive:true,force:true});}',
  ].join(String.fromCharCode(10));
  assert.doesNotThrow(() =>
    execFileSync(
      process.execPath,
      [
        "--conditions=react-server",
        "--import=tsx",
        "--input-type=module",
        "-e",
        code,
      ],
      { encoding: "utf8", timeout: 15000 },
    ),
  );
});
