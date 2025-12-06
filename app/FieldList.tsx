'use client';
import React, { useMemo } from 'react';
import { FieldNode } from './Parser';

interface IFieldListProps
{
    fields: FieldNode[];
}

const buildLines = (nodes: FieldNode[], indent: number, lines: string[]) =>
{
    const prefix = "  ".repeat(indent) + "- "; // two spaces per indent level
    for (const node of nodes)
    {
        lines.push(prefix + node.name);
        if (node.children && node.children.length > 0)
        {
            buildLines(node.children, indent + 1, lines);
        }
    }
};

export const FieldList = (props: IFieldListProps) =>
{
    const { fields } = props;

    const text = useMemo(() =>
    {
        const lines: string[] = [];
        buildLines(fields, 0, lines);
        return lines.join("\n");
    }, [fields]);

    return (
        <pre className="whitespace-pre font-mono text-sm text-black">
            {text}
        </pre>
    )
}