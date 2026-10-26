/**
 * PolyClay 7° - Motor Matemático y Evaluador Pedagógico Paso a Paso
 * Especializado en Polinomios Aritméticos con Enteros (Z) y Signos de Agrupación { [ ( ) ] }
 */

class PolyEngine {
  constructor() {
    this.bracketPairs = [
      { open: '(', close: ')', name: 'Paréntesis', type: 'paren', priority: 1 },
      { open: '[', close: ']', name: 'Corchete', type: 'square', priority: 2 },
      { open: '{', close: '}', name: 'Llave', type: 'curly', priority: 3 }
    ];
  }

  // Normalizar expresión (espacios limpios y caracteres estándar)
  normalize(expr) {
    if (!expr) return '';
    return expr
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Verificar balanceo de llaves, corchetes y paréntesis
  validateBrackets(expr) {
    const stack = [];
    const pairs = { ')': '(', ']': '[', '}': '{' };
    
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      if (char === '(' || char === '[' || char === '{') {
        stack.push({ char, pos: i });
      } else if (char === ')' || char === ']' || char === '}') {
        if (stack.length === 0) return { valid: false, error: `Cierre '${char}' sin apertura correspondiente.` };
        const last = stack.pop();
        if (last.char !== pairs[char]) {
          return { valid: false, error: `Se esperaba cerrar '${last.char}' pero se encontró '${char}'.` };
        }
      }
    }

    if (stack.length > 0) {
      return { valid: false, error: `Falta cerrar el signo '${stack[0].char}'.` };
    }

    return { valid: true };
  }

  // Encontrar el signo de agrupación más interno (por donde debe empezar el estudiante)
  findInnermostBracket(expr) {
    let lastOpenIdx = -1;
    let bracketMeta = null;

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      if (char === '(' || char === '[' || char === '{') {
        lastOpenIdx = i;
        bracketMeta = this.bracketPairs.find(p => p.open === char);
      } else if (char === ')' || char === ']' || char === '}') {
        if (bracketMeta && char === bracketMeta.close) {
          const content = expr.substring(lastOpenIdx + 1, i).trim();
          return {
            openIdx: lastOpenIdx,
            closeIdx: i,
            openChar: bracketMeta.open,
            closeChar: char,
            type: bracketMeta.type,
            name: bracketMeta.name,
            content,
            fullMatch: expr.substring(lastOpenIdx, i + 1)
          };
        }
      }
    }

    return null;
  }

  // Parsear una suma/resta de enteros, por ejemplo "-7 + 12" o "8 - 5" o "-3 - 4"
  solveSimpleExpression(exprStr) {
    const clean = exprStr.replace(/\s+/g, '');
    
    // Si es solo un número con signo (ej: "-5" o "8" o "+3")
    if (/^[+-]?\d+$/.test(clean)) {
      const val = parseInt(clean, 10);
      return {
        isSingleNumber: true,
        value: val,
        sign: val >= 0 ? '+' : '-',
        num: Math.abs(val)
      };
    }

    // Extraer tokens de números con signo: ej "-4 + 6" -> [-4, 6]
    const regex = /([+-]?\d+)/g;
    const tokens = [];
    let match;
    while ((match = regex.exec(clean)) !== null) {
      tokens.push(parseInt(match[1], 10));
    }

    if (tokens.length >= 2) {
      const a = tokens[0];
      const b = tokens[1];
      const result = a + b;

      // Generar tip pedagógico sobre signos iguales o contrarios
      let pedagogicalRule = '';
      if ((a >= 0 && b >= 0) || (a < 0 && b < 0)) {
        pedagogicalRule = `Signos iguales (${a >= 0 ? '+' : '-'} y ${b >= 0 ? '+' : '-'}): se suman sus valores absolutos (${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(result)}) y se conserva el mismo signo (${result >= 0 ? '+' : '-'}${Math.abs(result)}).`;
      } else {
        const mayor = Math.abs(a) >= Math.abs(b) ? a : b;
        const menor = Math.abs(a) >= Math.abs(b) ? b : a;
        pedagogicalRule = `Signos contrarios (${a >= 0 ? '+' : '-'} y ${b >= 0 ? '+' : '-'}): se restan (${Math.abs(mayor)} - ${Math.abs(menor)} = ${Math.abs(result)}) y gana el signo del número con mayor valor absoluto (${mayor >= 0 ? '+' : '-'}). Resultado: ${result >= 0 ? '+' : ''}${result}.`;
      }

      // Reconstruir la expresión simplificada
      const remainingTokens = tokens.slice(2);
      let simplifiedContent = (result >= 0 ? `+${result}` : `${result}`);
      if (remainingTokens.length > 0) {
        remainingTokens.forEach(t => {
          simplifiedContent += (t >= 0 ? ` + ${t}` : ` - ${Math.abs(t)}`);
        });
      }

      return {
        isSingleNumber: false,
        operandA: a,
        operandB: b,
        operationString: `${a} ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}`,
        result,
        resultSign: result >= 0 ? '+' : '-',
        resultNumber: Math.abs(result),
        pedagogicalRule,
        hasMoreTokens: remainingTokens.length > 0,
        simplifiedContent: simplifiedContent.trim()
      };
    }

    return { isSingleNumber: true, value: 0, sign: '+', num: 0 };
  }

  // Analizar el siguiente paso pedagógico en el polinomio
  getNextStep(expr) {
    const innermost = this.findInnermostBracket(expr);

    // Caso A: No hay más signos de agrupación: queda una operación directa de enteros
    if (!innermost) {
      const clean = expr.replace(/\s+/g, '');
      if (/^[+-]?\d+$/.test(clean)) {
        return {
          type: 'FINISHED',
          finalResult: parseInt(clean, 10),
          expression: expr
        };
      }

      const simple = this.solveSimpleExpression(expr);
      return {
        type: 'SOLVE_SIMPLE',
        subexpr: simple.operationString || expr,
        pedagogicalRule: simple.pedagogicalRule,
        expectedSign: simple.resultSign,
        expectedNum: simple.resultNumber,
        expectedVal: simple.result,
        bracketType: 'none',
        bracketName: 'Operación Final',
        currentExpr: expr,
        nextExpr: this.normalize(simple.simplifiedContent)
      };
    }

    // Caso B: El signo de agrupación más interno contiene solo un número con signo:
    // Por ejemplo: "15 - (+2)" o "8 + (-5)" o "- (-3)"
    const innerSimple = this.solveSimpleExpression(innermost.content);
    if (innerSimple.isSingleNumber) {
      // Verificar qué hay antes del signo de apertura
      const beforeBracket = expr.substring(0, innermost.openIdx).trim();
      const lastCharBefore = beforeBracket.slice(-1);
      const afterBracket = expr.substring(innermost.closeIdx + 1);

      let precedingSign = '+';
      let replaceStartIdx = innermost.openIdx;

      if (lastCharBefore === '-' || lastCharBefore === '+') {
        precedingSign = lastCharBefore;
        replaceStartIdx = expr.lastIndexOf(lastCharBefore, innermost.openIdx);
      }

      const numVal = innerSimple.value;
      const numSign = numVal >= 0 ? '+' : '-';
      
      // Aplicación de ley de signos:
      let finalSign = '+';
      if ((precedingSign === '-' && numSign === '-') || (precedingSign === '+' && numSign === '+')) {
        finalSign = '+';
      } else {
        finalSign = '-';
      }

      const absNum = Math.abs(numVal);
      const signWordA = precedingSign === '+' ? 'más' : 'menos';
      const signWordB = numSign === '+' ? 'más' : 'menos';
      const signWordRes = finalSign === '+' ? 'más (+)' : 'menos (-)';

      let ruleExplanation = `Ley de signos: "${signWordA}" por "${signWordB}" resulta en "${signWordRes}".`;
      if (precedingSign === '-') {
        ruleExplanation += ` Un signo menos (-) antes del signo de agrupación cambia el signo de lo que está adentro.`;
      } else {
        ruleExplanation += ` Un signo más (+) antes del signo de agrupación conserva el mismo signo.`;
      }

      // Reemplazo en la cadena
      let replacement = '';
      if (replaceStartIdx === 0) {
        replacement = finalSign === '+' ? `${absNum}` : `-${absNum}`;
      } else {
        replacement = ` ${finalSign} ${absNum} `;
      }

      const nextExpr = this.normalize(expr.substring(0, replaceStartIdx) + replacement + afterBracket);

      return {
        type: 'SUPPRESS_SIGN',
        innermost,
        precedingSign,
        numSign,
        absNum,
        expectedSign: finalSign,
        ruleExplanation,
        transformBefore: `${precedingSign} ${innermost.openChar} ${numVal >= 0 ? '+' : ''}${numVal} ${innermost.closeChar}`,
        transformAfter: `${finalSign} ${absNum}`,
        currentExpr: expr,
        nextExpr
      };
    }

    // Caso C: El signo de agrupación tiene operaciones por resolver adentro:
    // Por ejemplo: "(-7 + 12)" o "[ 8 - 4 + 3 ]"
    return {
      type: 'SOLVE_INSIDE',
      innermost,
      subexpr: innerSimple.operationString || innermost.content,
      pedagogicalRule: innerSimple.pedagogicalRule,
      expectedSign: innerSimple.resultSign,
      expectedNum: innerSimple.resultNumber,
      expectedVal: innerSimple.result,
      bracketType: innermost.type,
      bracketName: innermost.name,
      currentExpr: expr,
      nextExpr: this.normalize(
        expr.substring(0, innermost.openIdx + 1) +
        ` ${innerSimple.simplifiedContent} ` +
        expr.substring(innermost.closeIdx)
      )
    };
  }

  // Generar opciones de distracción inteligentes para la fase de "¿Por dónde empezar?"
  generateIdentifyOptions(expr, correctBracket) {
    const options = [];

    // 1. Opción correcta (el más interno)
    options.push({
      text: correctBracket.fullMatch,
      type: correctBracket.type,
      name: correctBracket.name,
      isCorrect: true,
      tag: '¡Correcto! Más interno',
      feedback: `¡Excelente! Según la jerarquía de las operaciones, siempre comenzamos de adentro hacia afuera, resolviendo primero los ${correctBracket.name}s.`
    });

    // 2. Si hay otros signos de agrupación exteriores, agregarlos como distractores realistas
    for (const b of this.bracketPairs) {
      if (b.type !== correctBracket.type && expr.includes(b.open)) {
        const start = expr.indexOf(b.open);
        const end = expr.lastIndexOf(b.close);
        if (start !== -1 && end !== -1 && end > start) {
          const sample = expr.substring(start, Math.min(start + 14, end + 1)) + (end > start + 13 ? '...' : '');
          options.push({
            text: sample,
            type: b.type,
            name: b.name,
            isCorrect: false,
            tag: `${b.name} exterior`,
            feedback: `¡Cuidado! Los ${b.name}s son más exteriores. Recuerda la regla de oro: primero paréntesis ( ), luego corchetes [ ], luego llaves { }.`
          });
        }
      }
    }

    // 3. Distractor de operaciones del inicio o del final
    const exteriorMatch = expr.match(/^([+-]?\s*\d+\s*[+-]\s*)/);
    if (exteriorMatch && options.length < 3) {
      options.push({
        text: exteriorMatch[0].trim() + ' ...',
        type: 'exterior',
        name: 'Operación exterior',
        isCorrect: false,
        tag: 'Operación exterior',
        feedback: `¡Alto ahí! No podemos hacer las operaciones de afuera hasta haber destruido o resuelto los signos de agrupación internos.`
      });
    }

    return options.sort(() => Math.random() - 0.5);
  }
}

if (typeof window !== 'undefined') {
  window.PolyEngine = PolyEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PolyEngine;
}
