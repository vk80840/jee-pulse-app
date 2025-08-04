import { DailyLogData, Goal, UserStats, TopicProgress } from "./data-types";

const STORAGE_KEYS = {
  DAILY_LOG: 'jee-pulse-daily-log',
  LIFETIME_PROGRESS: 'jee-pulse-lifetime-progress',
  USER_SETTINGS: 'jee-pulse-user-settings',
  SCHOOL_ATTENDANCE: 'jee-pulse-school-attendance',
  SYLLABUS_TRACKING: 'jee-pulse-syllabus-tracking',
  USER_STATS: 'jee-pulse-user-stats'
};

export const SYLLABUS_STRUCTURE = {
  Mathematics: {
    "Basic Mathematics": ["Number System", "Wavy Curve Method", "Logarithm", "Modulus", "Surds and Indices", "Sets", "Applications of Sets"],
    "Relation & Function": ["Geometrical Representation with Use of Sets", "Relation", "Functions", "Cartesian Products of Sets", "Domain and Range"],
    "Trigonometric Function": ["Trigonometric Ratios and Acute Angle", "Sign Convention, Trigonometric Functions", "Trigonometric Identities", "Transformed Formulae", "Maximum/Minimum Value Some Series", "Solution of Triangles", "Type of Trigonometric Equations"],
    "Quadratic Equation": ["Introduction", "Theory of Equations", "Graph of Quadratic Equation", "Roots of Equation", "Location of Roots", "Sum and Product of Roots", "Common Roots"],
    "Complex Number - I": ["Introduction, Complex Numbers", "Algebra of Complex Numbers", "Argand Plane & Conjugate", "Graph & Modulus of Complex", "Components of Complex Numbers", "Form of Complex Numbers", "DeMoivre's Theorem & Cube Roots of Unity"],
    "Sequence and Series": ["Arithmetic Progression (AP)", "Geometric Progression (GP)", "Harmonic Progression (HP)", "Insert n terms between two numbers", "Arithmetic Mean (AM), Geometric Mean (GM), Harmonic Mean (HM)", "Arithmetico-Geometric Series (AGS)", "Method of Differences", "Telescopic Series"],
    "Permutations and Combinations": ["Introduction", "Counting", "Permutations", "Circular Permutation", "Combinations", "Division and Distribution", "Derangement", "Some Results"],
    "Binomial Theorem": ["Numerically Greatest term of Binomial Expansion", "Sum of Coefficients in Binomial Expansion", "Summation of Series", "Multinomial Theorem", "Binomial Theorem for Any Index", "Standard Series"],
    "Straight Lines": ["Different forms of Triangle", "Area", "Slope", "Image", "Rotation of Image", "Angle between two lines", "Parallel and Perpendicular Lines", "Angle Bisector", "Transversal of Axis", "Family of Straight Lines", "Pair of Straight Lines", "General Form"],
    "Circles": ["Introduction", "Equation of Circle", "Position of Straight Line with Circle", "Tangent", "Chord with Point Form", "Chord with Angle Form", "Family of Circles", "Common Tangent", "Angle of Intersection of Two Circles", "Orthogonality of Two Circles", "Circle Circumscribing a Triangle (equilateral, right-angled triangle)"],
    "Conic Sections (Parabola)": ["Introduction", "Standard Form", "Focus and Directrix", "Eccentricity", "Types of Parabola", "Equation of Parabola", "Position of Line with Parabola", "Tangent & Normal", "Properties: Segment Area, Latus Rectum", "Chord in Parametric Form"],
    "Conic Sections (Ellipse)": ["Director Circle", "General Equation", "Area of Ellipse", "Position of Point and Line with Ellipse", "Position of Tangent", "Tangent & Normal", "Equation of Chord Joining Two Points", "Chord in Parametric Form"],
    "Conic Sections (Hyperbola)": ["Introduction", "Standard Form", "Focus and Directrix", "Eccentricity", "Asymptotes", "Properties: Segment Area", "Tangent & Normal", "Chord in Parametric Form"],
    "Complex Number - II": ["DeMoivre's Theorem", "Roots of Unity", "Cube Roots of Unity", "Position of Complex Number", "Conjugate and Modulus"],
    "Limits and Derivatives": ["Limits", "Derivatives", "Definition of Limit", "Derivatives by First Principle", "Basic Derivative Formulas"],
    "Statistics": ["Variance", "Standard Deviation", "Mean", "Median", "Mode", "Relation Among Median, Mode, and Mean", "Measuring Central Tendency", "Relative Variance and Frequency", "Cumulative Frequency"],
    "Probability": ["Introduction", "Types of Events", "Algebra of Events", "Conditional Probability", "Total Probability", "Bayes Theorem", "Axiomatic Theorem of Probability"],
    "Introduction to Three Dimensional Geometry": ["Coordinates of a Point in Space", "Distance Between Two Points", "Section Formula"],
    "Linear Inequalities": ["Introduction, Basic Concepts & Terminologies", "Solving Linear Inequalities (Linear and Two Variable Case)", "Graphical Method & Word Problems Related to Real-life Applications"],
    "Solution of Triangle": ["Introduction", "Law of Sines", "Law of Cosines", "Projection Formula", "Napier's Analogy", "Area of Triangle", "Angle of Triangle", "Centre of Triangle", "Equation of Triangle", "Extended Triangle", "Some Results"]
  },
  Physics: {
    "Units and Measurements": ["Introduction", "Physical Quantities", "System of Units", "Dimensions of Physical Quantities", "Dimensional Constants", "Non-dimensional Constants", "Dimensional Analysis and its Applications", "Significant Figures", "Errors in Measurement", "Principles of Accuracy & Dimensional analysis", "Applications of Dimensional Analysis"],
    "Mathematical Tools": ["Algebra, Logarithm, Exponentials", "Trigonometry", "Vectors - Basics", "Vectors - Operations", "Vector Products", "Coordinate Geometry: Basic concepts", "Quadratic equation, Binomial Approximation", "Graphs: Trig functions, position-time, velocity-time", "Calculus: Function and graph", "Differentiation", "Integration", "Definite Integration"],
    "Motion in a Straight Line": ["Introduction", "Position vector, displacement vector, distance travelled", "Velocity, Displacement, speed", "Acceleration", "Uniform and Non-uniform motion", "Motion under constant acceleration", "Graphical analysis", "Equations of Motion", "Relative motion in 1D", "Relative velocity problems", "Variable acceleration case", "Motion under gravity", "Graphical analysis in one-dimension only"],
    "Motion in a Plane": ["Scalar and Vector", "Vectors: Operations", "Position vector and Displacement", "Motion in 2D system", "Projectile motion", "Projectile from height", "Projectile on Inclined Plane", "Relative Motion in 2D", "T, K, H for projectile motion", "Concept of river, boat problems", "Change of axis, projectile in inclined plane", "Resultant velocity (Vector resultant)"],
    "Laws of Motion + Friction": ["Newton's Laws, Free-body diagrams", "Friction", "Types of friction", "Coefficient of friction", "Limiting friction", "Analysis of body on incline", "Pulley systems, Tension", "Constraint relations", "Combined system", "Inertial, non-inertial frames", "Pseudo forces", "Question on Pseudo Force", "Question on Friction", "Friction", "Inclined Plane"],
    "Circular Motion": ["Axis level kinematics (1st use of CM)", "Circular Dynamics, centrifugal/centripetal", "Non-uniform Circular Motion", "Harmonic Circular Motion", "Component acceleration", "Tangential Acceleration", "Symmetrical motion", "Banking of Roads", "Concepts of Circular Motion", "Vertical Circular Motion"],
    "Work, Energy and Power": ["Concept of work done by force, potential energy", "Work-Kinetic Energy Theorem, Potential energy curves", "Energy Conversion, Force potential", "Mechanical energy conservation", "Concept of internal energy", "Non-conservative forces", "Power, efficiency, and W.P.E.", "Concept of power, constant work and energy", "Work done by friction, incline, max KE", "Vertical Circular Motion"],
    "Centre of Mass & System of Particles": ["Concept of COM, Location for COM for discrete system", "COM for 2 particle system, COM for continuous mass distribution", "Momentum, impulse, conservation of linear momentum", "Collision theory, 1D and 2D Elastic & Inelastic collision", "Head on collision, coefficient of restitution", "COM collision and explosion", "Oblique collision", "Collision angle", "Concept of rigid body, fixed axis rotation", "Moment of Inertia, radius of gyration", "Parallel axis theorem, Perpendicular axis theorem", "Rolling", "Most classic rotation problems", "Concept for energy calculation of rotation", "Rotation final wrap"],
    "Rotational Motion": ["Torque and Lever Arm", "Rigid Body Rotation", "Angular Momentum and its conservation", "Conservation of L.T. CMF cases", "Pure rolling and slipping", "Energy conservation for rolling & pure rotation", "Introduction to Gravity", "Acceleration due to gravity and its variation", "Gravitational Potential Energy", "Escape Velocity", "Satellite motion, Kepler's law"],
    "Gravitation": ["Universal Law of Gravitation", "Orbital velocity, escape velocity", "Kepler's Law", "Satellite and energy in orbit", "Weightlessness"],
    "Mechanical Properties of Fluids": ["Fluid Mechanics basics", "Density, Pressure", "Pressure with height", "Buoyancy", "Equation of continuity", "Bernoulli's theorem", "Surface tension", "Viscosity"],
    "Mechanical Properties of Matter": ["Stress-strain relation", "Young's modulus", "Elastic behaviour of solids", "Bulk modulus", "Modulus of rigidity"],
    "Thermal Properties of Matter": ["Thermal Expansion", "Calorimetry", "Laws on Thermal conduction, Thermal conductivity", "Concept of thermal conduction, equivalent resistance", "Pervent (heat, impulse)"],
    "Kinetic Theory & Thermodynamics": ["Ideal gas equation and general concept of kinetic theory", "Ideal gas equation from kinetic theory, degree of freedom", "Work done and internal cyclic heat for ideal gas", "Isochoric process, Isothermal, Adiabatic, Isobaric", "Cyclic process"],
    "Simple Harmonic Motion": ["Spring Force system", "Spring mass system", "Combination of SHM", "Single block in SHM", "Combination of SHM"],
    "Waves": ["Basics to wave motion, velocity of wave", "Equation of wave, linearity and periodic wave", "String wave velocity", "K.E., P.E., Energy in wave", "Superposition of coherent wave, Interference", "Standing waves and Resonance"]
  },
  Chemistry: {
    "Physical Chemistry": {
      "Some Basic Concepts of Chemistry": ["Nature of Matter, Classification of Matter, Properties of Matter", "SI Units and Significant Figures", "Dimensional Analysis", "Uncertainty in Measurement, Use of Chemical Concentrations", "Atomic and Molecular Masses, Mole Concept", "Molar Mass, Avogadro's Number", "Percentage Composition, Empirical & Molecular Formula", "Stoichiometric Calculations", "Limiting Reagent, Concentration Terms & Applications"],
      "Structure of Atom": ["Atomic Models", "Electromagnetic Radiations, Nature of Light", "Planck's Quantum Theory, Photoelectric Effect, Line Spectrum", "Bohr's Atomic Model", "Dual Nature of Matter & de Broglie Equation", "Heisenberg Uncertainty Principle, Quantum Numbers", "Shapes of Orbitals", "Electronic Configuration, Aufbau, Pauli, Hund's Rule", "Rules for Filling of Orbitals", "Extra Stability of Half and Fully Filled Orbitals"],
      "States of Matter": ["The Gaseous State", "The Gas Laws, Ideal Gas Equation", "Dalton's Law, Graham's Law, Kinetic Theory", "Maxwell Distribution, Real Gases & Deviations", "van der Waals Equation", "Liquefaction of Gases"],
      "Thermodynamics": ["Introduction & Basic Terminology", "Types of Systems & Processes", "Work, Heat, Internal Energy, First Law of Thermodynamics", "Enthalpy, Heat Capacity, Thermochemical Equations", "Hess's Law", "Bond Enthalpy, Lattice Enthalpy", "Entropy & Second Law of Thermodynamics", "Gibbs Free Energy", "Spontaneity, Free Energy Change", "Comparing Stability via ∆G", "Free Energy and Equilibrium", "Third Law of Thermodynamics"],
      "Redox Reactions": ["Introduction", "Balancing Redox Reactions", "Concept of Oxidation Number", "Concept of Equivalent Factor"],
      "Chemical Equilibrium": ["Introduction, Characteristics", "Law of Mass Action", "Equilibrium Constant (Kp, Kc), Relationship", "Equilibrium Constant on Various Systems", "Degree of Dissociation"],
      "Ionic Equilibrium": ["Electrolytes, Theories of Acids/Bases", "Ionization of Water, pH & pOH", "Common-Ion Effect & Le Chatelier's Principle", "Buffer Solution", "Salt Hydrolysis", "Acid-Base Titrations", "Solubility & Solubility Product"]
    },
    "Inorganic Chemistry": {
      "Classification of Elements and Periodicity in Properties": ["Need for Classification of Elements", "Periodic Development of Periodic Table", "Periodic Law, Modern Periodic Table", "Nomenclature of Elements with Atomic Numbers > 100", "Electronic Configuration", "Periodic Trends in Properties", "Atomic and Ionic Radii", "Ionization Enthalpy", "Electron Gain Enthalpy", "Electronegativity"],
      "Chemical Bonding and Molecular Structure": ["Introduction: Octet Rule, Lewis Dot Structure", "Ionic Bond: Lattice Enthalpy, Factors affecting Lattice Enthalpy", "Born–Haber Cycle", "Covalent Bond: Lewis Dot Structure, Octet Rule Exceptions", "Formal Charge, Resonance", "Bond Parameters (Bond Length, Bond Angle, etc.)", "Valence Shell Electron Pair Repulsion Theory (VSEPR)", "Hybridization – Types and Examples", "Valence Bond Theory", "Molecular Orbital Theory", "Bond Order and Magnetic Nature", "Hydrogen Bonding, van der Waals Forces"],
      "p-Block Elements (Group 13 and 14)": ["Important Physical & Chemical Properties of Boron", "Important Compounds of Boron", "Physical & Chemical Properties of Aluminium", "Important Compounds of Aluminium", "Physical & Chemical Properties of Carbon", "Important Compounds of Carbon", "Physical & Chemical Properties of Silicon", "Important Compounds of Silicon"],
      "p-Block Elements (Group 15 and 16)": ["Group 15 Elements – Nitrogen Family", "Physical Properties, Trends", "Important Compounds of Nitrogen", "Group 16 Elements – Oxygen Family", "Physical & Chemical Properties of Sulphur", "Compounds of Sulphur"],
      "p-Block Elements (Group 17 and 18)": ["Group 17 Elements – Halogens", "Physical & Chemical Properties of Halogens", "Interhalogen Compounds", "Group 18 Elements – Noble Gases", "Properties, Trends, Uses"],
      "s-Block Elements": ["Group 1 Elements – Alkali Metals", "Group 2 Elements – Alkaline Earth Metals", "Physical Properties of Alkali & Alkaline Earth Metals", "Chemical Properties & Important Compounds", "Biological Role of s-Block Elements", "Anomalous Behavior of Lithium", "Diagonal Relationship"],
      "Hydrogen and Its Compounds": ["Position of Hydrogen in the Periodic Table", "Properties of Dihydrogen (H₂)", "Isotopes of Hydrogen", "Physical Properties of Dihydrogen", "Chemical Properties of Dihydrogen", "Uses of Dihydrogen", "Water & Its Anomalous Behavior"]
    },
    "Organic Chemistry": {
      "Some Basic Principles and Techniques (GOC)": ["Nomenclature of carbon chains of Simple and Branched Compounds (IUPAC)", "Classification of organic compounds based on structure and functional group", "IUPAC Nomenclature of Compounds with Polyfunctional Groups", "IUPAC Nomenclature of Compounds containing Halogen, Alcohol, Aldehyde, Ketone, Acids, Amine", "IUPAC of Aromatic Compounds", "IUPAC Naming of Ethers & Ketone Compounds, Common Names", "Covalent bond basics – Homolytic and Heterolytic fission, Electron displacement effects", "Arrow representation in mechanism, Carbocation, Carbanion, Free radicals, Aromatic Electrophilic & Nucleophilic Substitution", "Hyperconjugation, Resonance, Inductive Effect, Electromeric Effect", "Aromaticity, Acidity, Basicity", "Stability of Intermediates (Resonance, Length and Bond Angle Strength)", "Classification of Cleavage and reagents (Electrophile/Nucleophile)", "Types of Organic Reactions", "Mechanism of all basic organic reactions", "Crystallization, Sublimation, Distillation, Steam distillation, Differential extraction, Chromatography"],
      "Purification and Analysis of Organic Compounds": ["Statement of the principle of qualitative analysis", "Detection of elements (N, S, Cl, Br, I)", "Lassaigne's test", "Detection of Functional Groups", "Calculation of Structural Isomerism-1", "Calculation of Structural Isomerism-2", "Nomenclature & classification", "Concept of Isomerism, Optical Isomerism", "Physical and chemical methods of purification", "Element detection & estimation", "Optical isomerism basics (Polarimeter experiment)", "Optical isomerism: Chiral center, plane of symmetry, optical activity", "Optical isomerism: Enantiomers, Diastereomers", "Optical isomerism: Configuration system (R, S)"],
      "Hydrocarbon": ["Method of Preparation of Alkanes (Wurtz, Corey, Kolbe, etc.), Chemical Reactions of Alkanes (Combustion, Halogenation)", "Method of Preparation of Alkenes (Alcohol Dehydration, Dehydrohalogenation, etc.), Reactions of Alkenes (Addition reactions)", "Markovnikov's Rule, Anti-Markovnikov, Peroxide Effect, Mechanism of addition reactions", "Ozonolysis, Hydroboration-oxidation, Polymerization", "Physical & chemical properties of Alkyne", "Nomenclature and Isomerism in Alkynes", "Method of preparation of Alkynes and Reactions (Acidic nature, Electrophilic addition, oxidation)", "Aromatic hydrocarbon: Classification, Nomenclature, Resonance", "Aromaticity, Properties of Benzene", "Mechanism of Electrophilic Substitution (Nitration, Halogenation, Friedel–Crafts alkylation/acylation, Sulphonation)"],
      "Environmental Chemistry": ["Environmental Pollution", "Air Pollution", "Tropospheric Pollution", "Stratospheric Pollution", "Water Pollution", "Industrial Waste Management", "Green Chemistry", "Green Chemistry in Day-to-Day Life"]
    }
  }
} as const;

export class StorageManager {
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private static getTodayKey(): string {
    return this.formatDate(new Date());
  }

  static getTodayLog(): DailyLogData {
    const today = this.getTodayKey();
    const stored = localStorage.getItem(`${STORAGE_KEYS.DAILY_LOG}_${today}`);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      date: today,
      goals: [],
      sleep: {},
      studyData: {},
      lectures: [],
      notes: '',
      schoolAttendance: ''
    };
  }

  static saveTodayLog(data: Partial<DailyLogData>): void {
    const today = this.getTodayKey();
    const current = this.getTodayLog();
    const updated = { ...current, ...data };
    
    localStorage.setItem(`${STORAGE_KEYS.DAILY_LOG}_${today}`, JSON.stringify(updated));
    
    // Also save to lifetime progress at end of day
    this.updateLifetimeProgress(updated);
  }

  private static updateLifetimeProgress(dayData: DailyLogData): void {
    const lifetimeData = this.getLifetimeProgress();
    const existingIndex = lifetimeData.findIndex(log => log.date === dayData.date);
    
    if (existingIndex >= 0) {
      lifetimeData[existingIndex] = dayData;
    } else {
      lifetimeData.push(dayData);
    }
    
    localStorage.setItem(STORAGE_KEYS.LIFETIME_PROGRESS, JSON.stringify(lifetimeData));
    this.updateUserStats();
  }

  static getLifetimeProgress(): DailyLogData[] {
    const stored = localStorage.getItem(STORAGE_KEYS.LIFETIME_PROGRESS);
    return stored ? JSON.parse(stored) : [];
  }

  static addGoal(goal: Goal): void {
    const current = this.getTodayLog();
    current.goals.push(goal);
    this.saveTodayLog(current);
  }

  static updateGoal(goalId: string, updates: Partial<Goal>): void {
    const current = this.getTodayLog();
    const goalIndex = current.goals.findIndex(g => g.id === goalId);
    if (goalIndex >= 0) {
      current.goals[goalIndex] = { ...current.goals[goalIndex], ...updates };
      this.saveTodayLog(current);
    }
  }

  static updateSleepData(sleep: Partial<DailyLogData['sleep']>): void {
    const current = this.getTodayLog();
    current.sleep = { ...current.sleep, ...sleep };
    
    // Auto-calculate total hours if both times are present
    if (current.sleep.bedtime && current.sleep.wakeTime) {
      const bedtime = new Date(`2024-01-01 ${current.sleep.bedtime}`);
      const wakeTime = new Date(`2024-01-01 ${current.sleep.wakeTime}`);
      
      // Handle overnight sleep
      if (wakeTime < bedtime) {
        wakeTime.setDate(wakeTime.getDate() + 1);
      }
      
      const diffMs = wakeTime.getTime() - bedtime.getTime();
      current.sleep.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    }
    
    this.saveTodayLog(current);
  }

  static addStudySession(subject: string, session: { chapter: string; topic: string; count: number }): void {
    const current = this.getTodayLog();
    
    if (!current.studyData[subject]) {
      current.studyData[subject] = { target: 0, practiced: [] };
    }
    
    current.studyData[subject].practiced.push(session);
    this.saveTodayLog(current);
    
    // Update syllabus tracking
    this.updateSyllabusProgress(subject, session.chapter, session.topic, session.count, 0);
  }

  static setStudyTarget(subject: string, target: number): void {
    const current = this.getTodayLog();
    
    if (!current.studyData[subject]) {
      current.studyData[subject] = { target, practiced: [] };
    } else {
      current.studyData[subject].target = target;
    }
    
    this.saveTodayLog(current);
  }

  static addLecture(lecture: { subject: string; chapter: string; topic: string; duration: number }): void {
    const current = this.getTodayLog();
    current.lectures.push(lecture);
    this.saveTodayLog(current);
    
    // Update syllabus tracking
    this.updateSyllabusProgress(lecture.subject, lecture.chapter, lecture.topic, 0, 1);
  }

  static updateNotes(notes: string): void {
    const current = this.getTodayLog();
    current.notes = notes;
    this.saveTodayLog(current);
  }

  static updateSchoolAttendance(status: 'present' | 'absent' | 'holiday'): void {
    const current = this.getTodayLog();
    current.schoolAttendance = status;
    this.saveTodayLog(current);
  }

  private static updateSyllabusProgress(subject: string, chapter: string, topic: string, questions: number, lectures: number): void {
    const progress = this.getSyllabusProgress();
    const key = `${subject}-${chapter}-${topic}`;
    
    if (!progress[key]) {
      progress[key] = { subject, chapter, topic, questionsCompleted: 0, lecturesAttended: 0, goalsCompleted: 0 };
    }
    
    progress[key].questionsCompleted += questions;
    progress[key].lecturesAttended += lectures;
    
    localStorage.setItem(STORAGE_KEYS.SYLLABUS_TRACKING, JSON.stringify(progress));
  }

  static getSyllabusProgress(): Record<string, TopicProgress> {
    const stored = localStorage.getItem(STORAGE_KEYS.SYLLABUS_TRACKING);
    return stored ? JSON.parse(stored) : {};
  }

  private static updateUserStats(): void {
    const lifetimeData = this.getLifetimeProgress();
    const today = this.getTodayKey();
    
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let totalQuestions = 0;
    let totalStudyTime = 0;
    let presentDays = 0;
    let totalSchoolDays = 0;
    
    // Sort by date
    const sortedData = lifetimeData.sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate streaks and totals
    for (let i = 0; i < sortedData.length; i++) {
      const log = sortedData[i];
      
      // Count questions
      Object.values(log.studyData).forEach(subject => {
        subject.practiced.forEach(session => {
          totalQuestions += session.count;
        });
      });
      
      // Count study time (from lectures)
      log.lectures.forEach(lecture => {
        totalStudyTime += lecture.duration;
      });
      
      // Count attendance
      if (log.schoolAttendance === 'present') presentDays++;
      if (log.schoolAttendance === 'present' || log.schoolAttendance === 'absent') totalSchoolDays++;
      
      // Calculate streaks based on goals completion
      const hasActivity = log.goals.some(g => g.completed) || 
                         Object.keys(log.studyData).length > 0 || 
                         log.lectures.length > 0;
      
      if (hasActivity) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
        
        // Check if this continues to today
        const logDate = new Date(log.date + 'T00:00:00');
        const todayDate = new Date(today + 'T00:00:00');
        const daysDiff = Math.floor((todayDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0 || (i === sortedData.length - 1 && daysDiff <= 1)) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }
    
    const stats: UserStats = {
      currentStreak,
      bestStreak,
      totalQuestions,
      totalStudyTime: Math.round(totalStudyTime / 60 * 10) / 10, // Convert to hours
      attendancePercentage: totalSchoolDays > 0 ? Math.round((presentDays / totalSchoolDays) * 100) : 0
    };
    
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
  }

  static getUserStats(): UserStats {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Default stats
    return {
      currentStreak: 0,
      bestStreak: 0,
      totalQuestions: 0,
      totalStudyTime: 0,
      attendancePercentage: 0
    };
  }

  static updateAttendance(date: string, status: 'present' | 'absent' | 'holiday'): void {
    const logs = this.getLifetimeProgress();
    let todayLog = logs.find(log => log.date === date);
    
    if (!todayLog) {
      todayLog = this.createEmptyDailyLog(date);
      logs.push(todayLog);
    }
    
    todayLog.schoolAttendance = status;
    localStorage.setItem(STORAGE_KEYS.LIFETIME_PROGRESS, JSON.stringify(logs));
    this.updateUserStats();
  }

  static getWeeklyActivity(): Array<{ date: string; hours: number; schoolAttendance?: 'present' | 'absent' | 'holiday' }> {
    const lifetimeData = this.getLifetimeProgress();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      
      const dayLog = lifetimeData.find(log => log.date === dateStr);
      let hours = 0;
      
      if (dayLog) {
        dayLog.lectures.forEach(lecture => {
          hours += lecture.duration;
        });
      }
      
      weekData.push({
        date: dateStr,
        hours: Math.round(hours / 60 * 10) / 10,
        schoolAttendance: dayLog?.schoolAttendance
      });
    }
    
    return weekData;
  }

  static exportData(): string {
    return JSON.stringify({
      lifetimeProgress: this.getLifetimeProgress(),
      syllabusProgress: this.getSyllabusProgress(),
      userStats: this.getUserStats()
    }, null, 2);
  }

  static resetTodayLog(): void {
    const today = this.getTodayKey();
    localStorage.removeItem(`${STORAGE_KEYS.DAILY_LOG}_${today}`);
  }

  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Also clear individual daily logs
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.DAILY_LOG)) {
        localStorage.removeItem(key);
      }
    });
  }
}
