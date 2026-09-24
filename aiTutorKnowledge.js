/**
 * aiTutorKnowledge.js
 * Local knowledge base for the Learning Loops AI Tutor.
 * Keys are lowercase subject names. Each value is an array of topic objects.
 * Only Physics and Mathematics have content; other subjects return [].
 */
const aiTutorKnowledge = {
  physics: [
    {
      topic: "Newton's Laws of Motion",
      keywords: ["newton", "law of motion", "inertia", "force", "acceleration", "action reaction"],
      explanation:
        "Newton's three laws of motion describe the relationship between a body and the forces acting upon it.\n" +
        "1st Law (Inertia): An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.\n" +
        "2nd Law: Force equals mass times acceleration (F = ma).\n" +
        "3rd Law: For every action, there is an equal and opposite reaction.",
      example:
        "If you push a 5 kg box with a force of 20 N, the acceleration is:\na = F / m = 20 / 5 = 4 m/s²\n" +
        "When you jump off a boat, the boat moves in the opposite direction (3rd Law).",
      keyPoints: [
        "F = ma is the core equation of Newton's 2nd Law.",
        "Inertia is the tendency of an object to resist changes in its state of motion.",
        "Action and reaction forces always act on different objects.",
        "Net force determines acceleration, not individual forces.",
        "A body in equilibrium has zero net force acting on it.",
      ],
      practiceQuestion:
        "A car of mass 1000 kg accelerates from rest to 20 m/s in 10 seconds. What is the net force acting on the car?",
    },
    {
      topic: "Gravitation & Gravity",
      keywords: ["gravity", "gravitation", "gravitational", "free fall", "weight", "mass", "g value", "satellite"],
      explanation:
        "Gravity is the attractive force between any two objects with mass. The universal law of gravitation states:\n" +
        "F = G × (m₁ × m₂) / r²\n" +
        "where G = 6.674 × 10⁻¹¹ N·m²/kg², m₁ and m₂ are the masses, and r is the distance between their centres.\n" +
        "Near Earth's surface, this simplifies to: Weight (W) = m × g, where g ≈ 9.8 m/s².",
      example:
        "A person of mass 60 kg on Earth:\nWeight = 60 × 9.8 = 588 N\n" +
        "On the Moon (g ≈ 1.6 m/s²): Weight = 60 × 1.6 = 96 N\n" +
        "Mass remains the same (60 kg) everywhere — weight changes.",
      keyPoints: [
        "Mass is the amount of matter in an object (measured in kg); weight is the gravitational force on it (measured in N).",
        "g on Earth's surface ≈ 9.8 m/s².",
        "Gravitational force decreases as distance between objects increases.",
        "All objects fall with the same acceleration in the absence of air resistance.",
        "Satellites are in perpetual free fall around Earth.",
      ],
      practiceQuestion:
        "Calculate the gravitational force between two objects of masses 50 kg and 100 kg placed 2 m apart. (G = 6.674 × 10⁻¹¹ N·m²/kg²)",
    },
    {
      topic: "Work, Energy and Power",
      keywords: ["work", "energy", "power", "kinetic", "potential", "joule", "watt", "conservation of energy"],
      explanation:
        "Work is done when a force causes displacement in the direction of the force.\n" +
        "W = F × d × cos(θ)\n" +
        "Kinetic Energy (KE) = ½ mv²\n" +
        "Potential Energy (PE) = mgh\n" +
        "Power = Work / Time  (measured in Watts)\n" +
        "The Law of Conservation of Energy states that energy can neither be created nor destroyed — only converted.",
      example:
        "A 2 kg ball is lifted 5 m:\nPE = 2 × 9.8 × 5 = 98 J\n" +
        "When it falls and just before hitting ground:\nKE = 98 J  →  ½ × 2 × v² = 98  →  v = √98 ≈ 9.9 m/s",
      keyPoints: [
        "Work is zero if force and displacement are perpendicular.",
        "KE depends on velocity squared — doubling speed quadruples KE.",
        "Mechanical energy = KE + PE (conserved in the absence of friction).",
        "Power is the rate of doing work.",
        "1 Joule = 1 Newton × 1 metre.",
      ],
      practiceQuestion:
        "A motor lifts a 200 kg load to a height of 10 m in 20 seconds. What is the power of the motor? (g = 9.8 m/s²)",
    },
    {
      topic: "Light and Optics",
      keywords: ["light", "reflection", "refraction", "lens", "mirror", "optics", "concave", "convex", "prism", "wavelength", "speed of light"],
      explanation:
        "Light travels in straight lines at ~3 × 10⁸ m/s in vacuum.\n" +
        "Reflection: angle of incidence = angle of reflection (law of reflection).\n" +
        "Refraction: light bends when passing between media of different optical densities (Snell's Law: n₁ sin θ₁ = n₂ sin θ₂).\n" +
        "Lenses and mirrors form images; concave mirrors/lenses converge light, convex diverge.",
      example:
        "A ray of light passes from air (n=1) into glass (n=1.5) at 30°:\nsin θ₂ = (1 × sin 30°) / 1.5 = 0.5 / 1.5 ≈ 0.333\nθ₂ ≈ 19.5° (refracted angle is smaller — light bends toward normal).",
      keyPoints: [
        "Speed of light in vacuum c = 3 × 10⁸ m/s.",
        "Refractive index n = c / v (speed of light in medium).",
        "Concave mirrors are used in torches; convex mirrors in rear-view mirrors.",
        "A prism disperses white light into the visible spectrum (VIBGYOR).",
        "Total internal reflection occurs when light hits a less-dense medium above the critical angle.",
      ],
      practiceQuestion:
        "The refractive index of glass is 1.5. What is the speed of light in glass?",
    },
    {
      topic: "Electricity and Current",
      keywords: ["electricity", "current", "voltage", "resistance", "ohm", "circuit", "ohm's law", "series", "parallel", "conductor"],
      explanation:
        "Electric current (I) is the flow of electric charge measured in Amperes (A).\n" +
        "Ohm's Law: V = I × R  (Voltage = Current × Resistance)\n" +
        "In a series circuit, resistance adds: R_total = R₁ + R₂ + ...\n" +
        "In a parallel circuit: 1/R_total = 1/R₁ + 1/R₂ + ...\n" +
        "Power: P = V × I = I²R = V²/R",
      example:
        "A 12 V battery connects to a 6 Ω resistor:\nI = V / R = 12 / 6 = 2 A\nPower = V × I = 12 × 2 = 24 W",
      keyPoints: [
        "Current flows from high potential to low potential.",
        "Resistance depends on material, length, and cross-sectional area.",
        "Devices in series share the same current; devices in parallel share the same voltage.",
        "Insulators have very high resistance; conductors have very low resistance.",
        "Kilowatt-hour (kWh) is the commercial unit of electrical energy.",
      ],
      practiceQuestion:
        "Two resistors of 4 Ω and 6 Ω are connected in parallel across a 12 V battery. Find the total current drawn from the battery.",
    },
  ],

  mathematics: [
    {
      topic: "Quadratic Equations",
      keywords: ["quadratic", "quadratic equation", "roots", "discriminant", "factoring", "completing the square", "quadratic formula"],
      explanation:
        "A quadratic equation is of the form ax² + bx + c = 0, where a ≠ 0.\n" +
        "Methods to solve:\n" +
        "1. Factoring: express as (px + q)(rx + s) = 0\n" +
        "2. Quadratic Formula: x = (−b ± √(b²−4ac)) / 2a\n" +
        "3. Completing the Square\n\n" +
        "The discriminant D = b² − 4ac tells us the nature of roots:\n" +
        "D > 0 → two real distinct roots\n" +
        "D = 0 → one real repeated root\n" +
        "D < 0 → no real roots (complex)",
      example:
        "Solve x² − 5x + 6 = 0\nFactoring: (x − 2)(x − 3) = 0\nRoots: x = 2 and x = 3\n\n" +
        "Using the formula for x² − 3x − 4 = 0:\nD = (−3)² − 4(1)(−4) = 9 + 16 = 25\nx = (3 ± 5) / 2  →  x = 4 or x = −1",
      keyPoints: [
        "Every quadratic equation has exactly 2 roots (real or complex).",
        "Sum of roots = −b/a; Product of roots = c/a.",
        "A quadratic whose D < 0 has no real solutions.",
        "The parabola y = ax² + bx + c opens up if a > 0, down if a < 0.",
        "The vertex of the parabola is at x = −b / 2a.",
      ],
      practiceQuestion:
        "Find the roots of 2x² + 7x + 3 = 0 using the quadratic formula.",
    },
    {
      topic: "Trigonometry",
      keywords: ["trigonometry", "sin", "cos", "tan", "sine", "cosine", "tangent", "pythagoras", "right angle", "angle", "triangle", "trig ratios"],
      explanation:
        "Trigonometry studies relationships between angles and sides of triangles.\n\n" +
        "For a right-angled triangle (opposite, adjacent, hypotenuse):\n" +
        "sin θ = opposite / hypotenuse\n" +
        "cos θ = adjacent / hypotenuse\n" +
        "tan θ = opposite / adjacent\n\n" +
        "Pythagoras Theorem: a² + b² = c² (c = hypotenuse)\n\n" +
        "Key values: sin 30° = 0.5, cos 60° = 0.5, tan 45° = 1",
      example:
        "In a right triangle with opposite = 3, hypotenuse = 5:\nsin θ = 3/5 = 0.6  →  θ ≈ 36.87°\nadjacent = √(5² − 3²) = √16 = 4\ncos θ = 4/5 = 0.8\ntan θ = 3/4 = 0.75",
      keyPoints: [
        "SOH-CAH-TOA: Sin=Opp/Hyp, Cos=Adj/Hyp, Tan=Opp/Adj.",
        "Pythagoras theorem only applies to right-angled triangles.",
        "sin²θ + cos²θ = 1 (fundamental Pythagorean identity).",
        "Angles of elevation and depression use tan ratio.",
        "1 + tan²θ = sec²θ; 1 + cot²θ = cosec²θ.",
      ],
      practiceQuestion:
        "A ladder 10 m long leans against a wall. If the foot of the ladder makes an angle of 60° with the ground, how high does the ladder reach on the wall?",
    },
    {
      topic: "Arithmetic Progressions (AP)",
      keywords: ["arithmetic", "progression", "ap", "series", "sequence", "common difference", "nth term", "sum of n terms"],
      explanation:
        "An Arithmetic Progression (AP) is a sequence where the difference between consecutive terms is constant (called the common difference, d).\n\n" +
        "General term (nth term): aₙ = a + (n−1)d\n" +
        "Sum of n terms: Sₙ = n/2 × [2a + (n−1)d]  or  Sₙ = n/2 × (first + last)\n\n" +
        "where a = first term, d = common difference, n = number of terms.",
      example:
        "AP: 3, 7, 11, 15, ...\na = 3, d = 4\n10th term: a₁₀ = 3 + (10−1)×4 = 3 + 36 = 39\nSum of first 10 terms: S₁₀ = 10/2 × (2×3 + 9×4) = 5 × (6+36) = 5 × 42 = 210",
      keyPoints: [
        "Common difference d = any term − the preceding term.",
        "If d > 0, the AP is increasing; if d < 0, it is decreasing; if d = 0, all terms are equal.",
        "The middle term of a finite AP equals the average of the first and last terms.",
        "Sum formula uses either first/last term or first term and common difference.",
        "AP has a linear graph (arithmetic mean lies on a straight line).",
      ],
      practiceQuestion:
        "The 5th term of an AP is 22 and the 9th term is 38. Find the first term and common difference.",
    },
    {
      topic: "Statistics: Mean, Median and Mode",
      keywords: ["mean", "median", "mode", "average", "statistics", "central tendency", "data", "frequency"],
      explanation:
        "Measures of central tendency summarise a data set with a single representative value.\n\n" +
        "Mean = (Sum of all values) / (Number of values)\n" +
        "Median = Middle value when data is arranged in order\n" +
        "  - Odd number of values: middle term\n" +
        "  - Even number of values: average of two middle terms\n" +
        "Mode = The value that appears most frequently",
      example:
        "Data: 4, 7, 7, 9, 11, 13\nMean = (4+7+7+9+11+13) / 6 = 51 / 6 = 8.5\nMedian (6 values): average of 3rd and 4th = (7+9)/2 = 8\nMode = 7 (appears twice, most frequent)",
      keyPoints: [
        "Mean is affected by extreme values (outliers); median is not.",
        "A data set can have no mode, one mode, or multiple modes (bimodal/multimodal).",
        "Median is best for skewed distributions.",
        "For grouped data, calculate mean using the formula: x̄ = Σ(fᵢxᵢ) / Σfᵢ.",
        "Empirical relationship: Mode ≈ 3 Median − 2 Mean.",
      ],
      practiceQuestion:
        "Find the mean, median, and mode of the following data: 5, 8, 4, 5, 7, 10, 8, 5, 3, 9.",
    },
    {
      topic: "Polynomials",
      keywords: ["polynomial", "degree", "zeros", "roots", "factor theorem", "remainder theorem", "polynomial division", "cubic", "linear factor"],
      explanation:
        "A polynomial is an algebraic expression with one or more terms involving non-negative integer powers of a variable.\n" +
        "Degree = highest power of the variable.\n\n" +
        "Zeroes of a polynomial: values of x for which p(x) = 0.\n" +
        "Factor Theorem: (x − a) is a factor of p(x) if and only if p(a) = 0.\n" +
        "Remainder Theorem: When p(x) is divided by (x − a), remainder = p(a).\n\n" +
        "For a quadratic ax² + bx + c:\nSum of zeroes = −b/a,  Product of zeroes = c/a",
      example:
        "p(x) = x² − 5x + 6\nZeroes: set p(x) = 0  →  (x−2)(x−3) = 0  →  x = 2, 3\nSum = 2 + 3 = 5 = −(−5)/1 ✓\nProduct = 2 × 3 = 6 = 6/1 ✓",
      keyPoints: [
        "A polynomial of degree n has at most n zeroes.",
        "A linear polynomial has exactly 1 zero.",
        "A quadratic polynomial can have 0, 1, or 2 zeroes.",
        "Geometrically, zeroes are x-intercepts of the graph y = p(x).",
        "Degree 0 = constant, 1 = linear, 2 = quadratic, 3 = cubic.",
      ],
      practiceQuestion:
        "If one zero of the polynomial p(x) = 3x² + kx − 4 is 1, find the value of k and the other zero.",
    },
  ],

  chemistry: [],
  biology: [],
  "computer science": [],
  programming: [],
};

export default aiTutorKnowledge;
