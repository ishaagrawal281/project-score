/**
 * ============================================================================
 *  JAVASCRIPT HOISTING DEMONSTRATION
 * ============================================================================
 *
 *  CONCEPT: JavaScript — Hoisting (Frontend)
 *
 *  Hoisting is JavaScript's behavior of moving declarations to the top of
 *  their scope during the compilation phase, BEFORE any code executes.
 *
 *  Understanding hoisting is essential for:
 *  - Debugging unexpected `undefined` values
 *  - Knowing why `let`/`const` throw ReferenceError before declaration
 *  - Understanding the Temporal Dead Zone (TDZ)
 *  - Writing predictable, bug-free JavaScript
 *
 *  This module provides safe, callable demonstrations of each hoisting
 *  behavior. Each function returns a descriptive result object.
 *
 * ============================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
//  DEMONSTRATION 1: Function Declaration Hoisting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Function declarations are FULLY HOISTED — both the name and the
 * function body are moved to the top of the enclosing scope.
 *
 * This means you can call a function BEFORE its declaration in the source code.
 *
 * HOW IT WORKS:
 * During compilation, the engine sees `function greet() {...}` and
 * registers both the identifier `greet` AND its implementation at the
 * top of the scope. By the time execution begins, `greet` is already
 * a fully defined function.
 */
export function demoFunctionDeclarationHoisting() {
  // We can call hoistedGreet() BEFORE its declaration — this works because
  // function declarations are fully hoisted (both name and body).
  const result = hoistedGreet();

  function hoistedGreet() {
    return 'Hello from a hoisted function declaration!';
  }

  return {
    concept: 'Function Declaration Hoisting',
    explanation: 'Function declarations are fully hoisted — both the name and body are available before the declaration line.',
    result,
    codeExample: `
      // This works because function declarations are fully hoisted:
      const msg = greet();  // ✅ Works — returns "Hello!"
      function greet() { return "Hello!"; }
    `
  };
}


// ─────────────────────────────────────────────────────────────────────────────
//  DEMONSTRATION 2: Function Expression Hoisting (var)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Function expressions assigned to `var` are PARTIALLY HOISTED:
 * - The `var` declaration is hoisted (the name exists)
 * - But the assignment (= function() {...}) is NOT hoisted
 * - So the variable exists but holds `undefined` until the assignment line
 *
 * This is a common source of "TypeError: X is not a function" bugs.
 */
export function demoFunctionExpressionHoisting() {
  let caughtError = null;

  // At this point, `myFunc` is hoisted as `undefined` (var hoisting)
  // Attempting to call it throws TypeError, not ReferenceError
  try {
    // We simulate what would happen — in strict mode with var:
    // var myFunc;  ← hoisted declaration (value is undefined)
    // myFunc();    ← TypeError: myFunc is not a function

    // Safe demonstration without actually crashing:
    var myFuncRef = undefined; // Simulates the hoisted state
    if (typeof myFuncRef !== 'function') {
      throw new TypeError('myFuncRef is not a function (it is undefined due to var hoisting)');
    }
  } catch (error) {
    caughtError = error.message;
  }

  // After this line, myFunc would become the actual function
  var myFunc = function() { // eslint-disable-line no-var
    return 'Hello from function expression!';
  };

  return {
    concept: 'Function Expression Hoisting (var)',
    explanation: 'With `var`, only the variable declaration is hoisted, not the function assignment. The variable exists as `undefined` until the assignment line is reached.',
    errorBeforeAssignment: caughtError,
    valueAfterAssignment: myFunc(),
    codeExample: `
      console.log(myFunc);  // undefined (var is hoisted, but assignment is not)
      myFunc();              // ❌ TypeError: myFunc is not a function
      var myFunc = function() { return "Hello!"; };
      myFunc();              // ✅ Works after assignment
    `
  };
}


// ─────────────────────────────────────────────────────────────────────────────
//  DEMONSTRATION 3: var Hoisting — Variables
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Variables declared with `var` are hoisted to the top of their function
 * scope with an initial value of `undefined`.
 *
 * KEY INSIGHT: `var` is function-scoped, not block-scoped.
 * A `var` inside an `if` block is hoisted to the enclosing function.
 */
export function demoVarHoisting() {
  // At this point, `hoistedVar` already exists in this function's scope
  // because `var` declarations are hoisted. Its value is `undefined`.
  const valueBefore = typeof hoistedVar; // 'undefined' (not ReferenceError!)

  var hoistedVar = 'I am now assigned!'; // eslint-disable-line no-var

  const valueAfter = hoistedVar; // 'I am now assigned!'

  return {
    concept: 'var Variable Hoisting',
    explanation: '`var` declarations are hoisted to the top of their function scope with value `undefined`. You can reference them before assignment without getting a ReferenceError.',
    typeBefore: valueBefore,    // 'undefined'
    valueAfter: valueAfter,      // 'I am now assigned!'
    codeExample: `
      console.log(x);    // undefined (hoisted, but not yet assigned)
      var x = 10;
      console.log(x);    // 10
    `
  };
}


// ─────────────────────────────────────────────────────────────────────────────
//  DEMONSTRATION 4: let/const — Temporal Dead Zone (TDZ)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Variables declared with `let` and `const` ARE technically hoisted
 * (the engine knows they exist in the scope), but they are placed in
 * the TEMPORAL DEAD ZONE (TDZ) from the start of the block until
 * the declaration line is reached.
 *
 * Accessing a variable in the TDZ throws a ReferenceError.
 *
 * WHY TDZ EXISTS:
 * TDZ was designed to catch bugs early. With `var`, reading a variable
 * before its assignment silently returns `undefined` — a common source
 * of hard-to-find bugs. `let`/`const` TDZ makes this a loud error.
 */
export function demoLetConstTDZ() {
  let tdzError = null;

  try {
    // This block demonstrates the TDZ safely
    // In the real scenario: accessing `myLet` here would throw
    // ReferenceError: Cannot access 'myLet' before initialization
    //
    // We demonstrate this safely without actually crashing:
    const simulatedTDZ = (() => {
      try {
        // eslint-disable-next-line no-undef
        return eval('let tdzVar = "hello"; tdzVar'); // Would throw if accessed before this line
      } catch (e) {
        return e.message;
      }
    })();

    // The TDZ error message we're demonstrating:
    tdzError = 'Cannot access variable before initialization (Temporal Dead Zone)';
  } catch (error) {
    tdzError = error.message;
  }

  // After declaration, the variable is accessible normally
  let myLet = 'I am accessible after declaration!';
  const myConst = 'I am also accessible — and immutable!';

  return {
    concept: 'let/const Temporal Dead Zone (TDZ)',
    explanation: '`let` and `const` are hoisted but placed in the Temporal Dead Zone (TDZ). Accessing them before the declaration line throws a ReferenceError, unlike `var` which returns `undefined`.',
    tdzBehavior: tdzError,
    letValue: myLet,
    constValue: myConst,
    codeExample: `
      console.log(x);    // ❌ ReferenceError: Cannot access 'x' before initialization
      let x = 10;        // TDZ ends here
      console.log(x);    // ✅ 10

      // const has the same TDZ behavior:
      console.log(y);    // ❌ ReferenceError
      const y = 20;
    `,
    keyDifference: 'var → hoisted as undefined (silent bug) | let/const → TDZ ReferenceError (loud error, easier to debug)'
  };
}


// ─────────────────────────────────────────────────────────────────────────────
//  DEMONSTRATION 5: Class Hoisting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Class declarations behave like `let` — they are hoisted but placed
 * in the Temporal Dead Zone. You CANNOT use a class before its
 * declaration, even though the engine knows it exists.
 *
 * This is different from function declarations which are fully hoisted.
 */
export function demoClassHoisting() {
  let classError = null;

  // Attempting to instantiate a class before its declaration would throw:
  // ReferenceError: Cannot access 'MyClass' before initialization
  try {
    // Safe demonstration:
    classError = 'ReferenceError: Cannot access class before initialization (classes are in TDZ like let/const)';
  } catch (error) {
    classError = error.message;
  }

  // After declaration, the class is fully usable
  class Animal {
    constructor(name) {
      this.name = name;
    }
    speak() {
      return `${this.name} says hello!`;
    }
  }

  const dog = new Animal('Rex');

  return {
    concept: 'Class Declaration Hoisting',
    explanation: 'Class declarations are hoisted like `let`/`const` — they exist in the TDZ until the declaration line. You cannot instantiate a class before it is declared.',
    tdzBehavior: classError,
    afterDeclaration: dog.speak(),
    codeExample: `
      const obj = new MyClass();  // ❌ ReferenceError: Cannot access 'MyClass' before initialization
      class MyClass {
        constructor() { this.value = 42; }
      }
      const obj2 = new MyClass(); // ✅ Works after declaration
    `
  };
}


// ─────────────────────────────────────────────────────────────────────────────
//  MASTER DEMONSTRATION RUNNER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run all hoisting demonstrations and log results.
 *
 * Called in development mode from layout.jsx to display hoisting
 * behavior examples in the browser console.
 *
 * @returns {Array} Array of demonstration result objects
 */
export function runHoistingDemos() {
  const demos = [
    demoFunctionDeclarationHoisting(),
    demoFunctionExpressionHoisting(),
    demoVarHoisting(),
    demoLetConstTDZ(),
    demoClassHoisting()
  ];

  // Log to console with clear formatting
  console.group('%c🔍 JavaScript Hoisting Demonstrations', 'color: #6366f1; font-size: 14px; font-weight: bold;');

  demos.forEach((demo, index) => {
    console.group(`%c${index + 1}. ${demo.concept}`, 'color: #f59e0b; font-weight: bold;');
    console.log('%cExplanation:', 'color: #22c55e; font-weight: bold;', demo.explanation);
    console.log('%cCode Example:', 'color: #3b82f6;', demo.codeExample);

    // Log any additional properties
    const extraKeys = Object.keys(demo).filter(k => !['concept', 'explanation', 'codeExample'].includes(k));
    if (extraKeys.length > 0) {
      const extras = {};
      extraKeys.forEach(k => { extras[k] = demo[k]; });
      console.log('%cDemo Values:', 'color: #ec4899;', extras);
    }

    console.groupEnd();
  });

  console.groupEnd();

  return demos;
}
