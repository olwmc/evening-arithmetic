function tokenize(expr) {
    // Clean up the original expression and split it into characters
    expr = expr.replace(/ /g, '').split("")

    // List of tokens to return
    tokens = []

    // While there's still chars left
    while (expr.length > 0) {

        // Get the current token as the first char
        token = expr.shift()

        // Reset float checker
        isFloat = false

        // If the char is not undefined and is a number
        if (token !== undefined && token.match(/[0-9]/)) {

            // New temp number
            num = ""

            // While not undefined and a number
            while (token !== undefined && token.match(/[0-9]/)) {

                // Append char to number string
                num += token

                // Get next token
                token = expr.shift()

                // If one of the tokens is a period, turn on isFloat and add it to the string
                if (token == ".") {
                    isFloat = true
                    num += token
                    token = expr.shift()
                }
            }

            // If isfloat is on, the number is floating point, so parse it as a float
            if (isFloat) {
                tokens.push(parseFloat(num))
            }

            // Otherwhise parse it as an int
            else {
                tokens.push(parseInt(num))
            }

            // Replaced dropped token
            expr.unshift(token)
        }

        // If it's not a number, it's an op, so just push it
        else if (token !== undefined) {
            tokens.push(token)
        }
    }

    // Return the tokens
    return tokens
}

function parse(tokens) {
    // New AST starts out as tokens
    let ast = tokens

    for (let i = 0; i < ast.length; ++i) {
        // If token is a negative sign
        if (ast[i] == "-") {

            // Check the character before for None, (, *, /, or +, and that the next
            // token is a number
            if ((ast[i - 1] == undefined || ast[i - 1] == "(" || ast[i - 1] == "*" ||
                    ast[i - 1] == "/" || ast[i - 1] == "+") &&
                typeof(ast[i + 1]) == "number") {
                
                // SPlice in the negative number expression
                ast.splice(i, 2, {
                    type: "expression",
                    statements: -ast[i + 1]
                })
            }   
        }
    }
    // Build parenthesis tree {{P}EMDAS}
    for (let i = 0; i < ast.length; ++i) {
        if (ast[i] == "(") {
            let j = 0
            let numOpen = 0;

            // Find the number of indexes away from i
            // that the corresponding closing parenthesis
            // appears
            for (let k = i; k < ast.length; k++) {
                if (ast[k] == "(") {
                    numOpen++
                } else if (ast[k] == ")") {
                    numOpen--
                }

                j++

                if (numOpen == 0) {
                    break
                }
            }

            // Splice, from one parenthesis to it's partner
            // the parsed version of the inside of those
            // parenthesis
            ast.splice(i, j,
                parse(ast.slice(i + 1, i + j - 1)));

            i = 0
        }
    }

    // Build exponentiation tree {P[E]MDAS}
    for (let i = 0; i < ast.length; ++i) {
        if (ast[i] == "^") {

            // Splice in binary operation object
            ast.splice(i - 1, 3, {
                type: "binaryOp",
                op: ast[i],
                left: ast[i - 1],
                right: ast[i + 1]
            });

            // Reset back to 0 so we can build the tree
            // from left to right
            i = 0
        }
    }

 
    // Build mult/div tree {PE[MD]AS}
    for (let i = 0; i < ast.length; ++i) {

        // Splice in an binary operation object 
        if (ast[i] == "*" || ast[i] == "/") {
            ast.splice(i - 1, 3, {
                type: "binaryOp",
                op: ast[i],
                left: ast[i - 1],
                right: ast[i + 1]
            });
            i = 0
        }
    }

    // Build add/sub tree {PE[MD]AS}
    for (let i = 0; i < ast.length; ++i) {
        if (ast[i] == "+" || ast[i] == "-") {

            // Splice in binary operation object
            ast.splice(i - 1, 3, {
                type: "binaryOp",
                op: ast[i],
                left: ast[i - 1],
                right: ast[i + 1]
            });

            // Reset back to 0 so we can build the tree
            // from left to right
            i = 0
        }
    }
    // Return the AST as the first index of the replaced tokens
    return {
        type: "expression",
        statements: ast[0]
    }
}

// Recursive postorder traversal
function evaluate(node) {

    // If object, (FIX LATER), recall evaluate op
    if (node.type == "expression") {
        return evaluate(node.statements)
    } else if (node.type == "binaryOp") {
        return evaluateOp(node)
    }

    // Else just return the number
    else if (typeof(node) == "number") {
        return node
    }
}

function evaluateOp(node) {
    // Evaluate the left side fully, then the right side, then
    // apply the binary op to both.
    if (node.op == "+") {
        return evaluate(node.left) + evaluate(node.right)
    } else if (node.op == "-") {
        return evaluate(node.left) - evaluate(node.right)
    } else if (node.op == "*") {
        return evaluate(node.left) * evaluate(node.right)
    } else if (node.op == "/") {
        return evaluate(node.left) / evaluate(node.right)
    } else if (node.op == "^") {
        return Math.pow(evaluate(node.left), evaluate(node.right))
    }
}

function math_eval(math) {
    return evaluate(parse(tokenize(math)))
}

eqs = [
        "(2) + (17*2-30) * (5)+2 - (8/2)*4",
        "(((((5)))))",
        "(( ((2)) + 4))*((5))",
        "(( ((2.221212)) + 4))*((5))",
        "(-5 * -3) * -1 - 1"
]

for(eq in eqs) {
   console.log(math_eval(eq) == eval(eq))
}
