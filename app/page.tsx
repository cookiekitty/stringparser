'use client';
import React, { useMemo, useState } from "react";
import { FieldList } from "./FieldList";
import { FieldNode, parseInput, sortFields } from "./Parser";

const DEFAULT_INPUT =
  '(id, name, email, type(id, name, customFields(c1, c2, c3)), externalId)';

const Home = () =>
{
  const [input, setInput] = useState<string>(DEFAULT_INPUT);
  const { originalTree, sortedTree, error } = useMemo(() =>
  {
    try {
      const tree: FieldNode[] = parseInput(input);
      const sorted: FieldNode[] = sortFields(tree);
      return {
        originalTree: tree,
        sortedTree: sorted,
        error: null as string | null,
      };
    } catch (e) {
      const err = e as Error;
      return {
        originalTree: [] as FieldNode[],
        sortedTree: [] as FieldNode[],
        error: err.message,
      };
    }
  }, [input]);

  return (
    <main className="min-h-screen bg-white p-8 text-black">
      <div className="font-sans max-w-5xl mx-auto bg-gray-100 rounded-lg shadow-lg p-8 border border-gray-300">
        <h1 className="text-3xl font-bold mb-6 text-black">Field Selection Parser</h1>
        <p className="text-black mb-3 leading-relaxed">
          Paste a selection string like
          <code className="px-1 py-0.5 bg-gray-300 border border-gray-400 rounded mx-1 text-xs font-mono text-black">
            {DEFAULT_INPUT}
          </code>
          to see its parsed structure.
        </p>

        <textarea
          spellCheck={false}
          className="w-full h-32 p-3 border border-gray-700 rounded font-mono text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
          value={input}
          onChange={e => setInput(e.target.value)}
        />

        {error && (
          <p className="text-red-700 font-semibold mt-3">
            Parse error: {error}
          </p>
        )}

        {!error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
            <section className="p-4 bg-white border border-gray-400 rounded">
              <h2 className="text-xl font-bold mb-3 text-black">Original order</h2>
              <FieldList fields={originalTree} />
            </section>

            <section className="p-4 bg-white border border-gray-400 rounded">
              <h2 className="text-xl font-bold mb-3 text-black">
                Alphabetically sorted
              </h2>
              <FieldList fields={sortedTree} />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default Home;
