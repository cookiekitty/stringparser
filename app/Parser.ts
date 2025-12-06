
export interface FieldNode
{
    name: string;
    children?: FieldNode[];
}

type TokenType = "NAME" | "LPAREN" | "RPAREN" | "COMMA" | "EOF";

const tokenDisplay = (type: TokenType): string =>
{
    switch (type) {
        case "LPAREN":
            return "'('";
        case "RPAREN":
            return "')'";
        case "COMMA":
            return "','";
        case "NAME":
            return "a field name";
        case "EOF":
            return "the end of the input";
        default:
            return type;
    }
};

interface Token
{
    type: TokenType;
    value?: string;
    position: number;
}

interface ParserState
{
    tokens: Token[];
    index: number;
}

const isWhitespace = (ch: string): boolean => /\s/.test(ch);
const isDelimiter = (ch: string): boolean => ch === "(" || ch === ")" || ch === ",";

const tokenize = (input: string): Token[] =>
{
    const text = input;
    const tokens: Token[] = [];
    let i = 0;

    while (i < text.length)
    {
        const ch = text[i];

        if (isWhitespace(ch))
        {
            i++;
            continue;
        }

        if (ch === "(")
        {
            tokens.push({ type: "LPAREN", position: i });
            i++;
            continue;
        }

        if (ch === ")")
        {
            tokens.push({ type: "RPAREN", position: i });
            i++;
            continue;
        }

        if (ch === ",")
        {
            tokens.push({ type: "COMMA", position: i });
            i++;
            continue;
        }

        // NAME: any run of characters that are NOT whitespace or delimiters
        const start = i;
        while (i < text.length && !isWhitespace(text[i]) && !isDelimiter(text[i]))
        {
            i++;
        }
        const value = text.slice(start, i);
        tokens.push({ type: "NAME", value, position: start });
    }

    tokens.push({ type: "EOF", position: text.length });
    return tokens;
};

const peek = (state: ParserState): Token => state.tokens[state.index];

const consume = (state: ParserState, expectedType?: TokenType): Token =>
{
    const token = state.tokens[state.index];
    if (!token)
    {
        throw new Error("Unexpected end of tokens");
    }
    if (expectedType && token.type !== expectedType)
    {
        throw new Error(`Expected ${tokenDisplay(expectedType)} but found ${tokenDisplay(token.type)} at position ${token.position}.`);
    }
    state.index++;
    return token;
};

const parseField = (state: ParserState): FieldNode =>
{
    const nameToken = consume(state, "NAME");
    const node: FieldNode = { name: nameToken.value ?? "" };

    const next = peek(state);
    if (next.type === "LPAREN")
    {
        consume(state, "LPAREN");
        const children = parseFields(state, ["RPAREN"]);
        consume(state, "RPAREN");
        if (children.length > 0)
        {
            node.children = children;
        }
    }

    return node;
};

const parseFields = (state: ParserState, terminators: TokenType[]): FieldNode[] =>
{
    const fields: FieldNode[] = [];

    while (true)
    {
        const token = peek(state);

        if (terminators.includes(token.type))
        {
            break;
        }

        if (token.type === "EOF")
        {
            break;
        }

        if (token.type !== "NAME")
        {
            throw new Error(`Expected NAME but found ${token.type} at position ${token.position}`);
        }

        const field = parseField(state);
        fields.push(field);

        const next = peek(state);

        if (next.type === "COMMA")
        {
            consume(state, "COMMA");
            continue;
        }

        if (terminators.includes(next.type) || next.type === "EOF")
        {
            break;
        }

        throw new Error(`Expected ',' or one of [${terminators.join(", ")}] but found ${next.type} at position ${next.position}`);
    }

    return fields;
};

export const parseInput = (input: string): FieldNode[] =>
{
    const tokens = tokenize(input);
    const state: ParserState = { tokens, index: 0 };

    const first = peek(state);

    // Optional outer parentheses: ( ... )
    if (first.type === "LPAREN")
    {
        consume(state, "LPAREN");
        const result = parseFields(state, ["RPAREN"]);
        consume(state, "RPAREN");

        const after = peek(state);
        if (after.type !== "EOF")
        {
            throw new Error(`Unexpected token '${after.type}' at position ${after.position}`);
        }

        return result;
    }

    // No outer parens: parse up to EOF
    const result = parseFields(state, ["EOF"]);
    const after = peek(state);
    if (after.type !== "EOF")
    {
        throw new Error(`Unexpected token '${after.type}' at position ${after.position}`);
    }

    return result;
};

export const sortFields = (fields: FieldNode[]): FieldNode[] =>
{
    return fields
        .map(field => 
        ({
            ...field, 
            children: field.children ? sortFields(field.children) : undefined,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}