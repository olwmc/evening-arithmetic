# evening-arithmetic
Challenge to myself to build by first arithmetic expression evaluator. Completed in about 6 hours.

Recursive-descent parser that builds an expression tree and then evaluates using postorder traversal.

Demo here https://olwmc.github.io/pages/arithmetic.html

It's rough around the edges, but passes most inputs I've given it

Interestingly, because of the way I track parenthesis, it's tolerant to right-hanging closed parenthesis.
