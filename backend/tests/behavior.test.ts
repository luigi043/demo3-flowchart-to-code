import { execFileSync } from 'child_process';
import vm from 'vm';
import { convertFlowchart } from '../src/services/conversionService';
import { Flowchart } from '../src/models/types';
import fixture from '../../examples/even-odd.json';

const chart = fixture.flowchart as Flowchart;
test.each([[-4, 'Even'], [0, 'Even'], [7, 'Odd']])('generated JavaScript executes for %s', (input, expected) => {
  const code = convertFlowchart(chart).result!.javascript;
  const output: string[] = [];
  vm.runInNewContext(code, { prompt: () => String(input), console: { log: (x: string) => output.push(x) } });
  expect(output).toEqual([expected]);
});

test('shared statements execute once after either branch', () => {
  const fc: Flowchart = JSON.parse(JSON.stringify(chart));
  fc.nodes.push({ id: 'merge', type: 'output', label: '"Done"' });
  fc.edges.filter(e => e.target === '6').forEach(e => e.target = 'merge');
  fc.edges.push({ id: 'last', source: 'merge', target: '6' });
  const result = convertFlowchart(fc).result!;
  expect(result.pseudocode.indexOf('END IF')).toBeLessThan(result.pseudocode.indexOf('OUTPUT "Done"'));
  for (const input of [2, 3]) {
    const out: string[] = [];
    vm.runInNewContext(result.javascript, { prompt: () => String(input), console: { log: (x: string) => out.push(x) } });
    expect(out).toEqual([input === 2 ? 'Even' : 'Odd', 'Done']);
  }
});

test('rejects cycles, dangling edges and malformed payloads', () => {
  expect(convertFlowchart({} as Flowchart).success).toBe(false);
  const fc: Flowchart = JSON.parse(JSON.stringify(chart));
  fc.edges.push({ id: 'cycle', source: '4', target: '3' });
  expect(convertFlowchart(fc).success).toBe(false);
  fc.edges.push({ id: 'missing', source: 'unknown', target: '6' });
  expect(convertFlowchart(fc).errors!.join(' ')).toContain('unknown node');
});

// Set PYTHON to a Python 3 executable to verify the generated Python too.
(process.env.PYTHON ? test : test.skip)('Python matches JavaScript on both branches and zero', () => {
  const code = convertFlowchart(chart).result!.python;
  for (const n of [-4, 0, 7]) {
    const output = execFileSync(process.env.PYTHON!, ['-c', code], { input: `${n}\n`, encoding: 'utf8' });
    expect(output.trim().endsWith(n === 7 ? 'Odd' : 'Even')).toBe(true);
  }
});
