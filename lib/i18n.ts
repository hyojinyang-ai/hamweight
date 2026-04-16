export type Locale = "en" | "ko";

const translations = {
  en: {
    // App
    appName: "MyWeight",
    appNameKr: "마이웨이트",

    // Home
    logWeight: "Log Weight",
    getStarted: "Get Started",
    tapToLog: "Tap to log your first weight!",
    setWeightGoal: "Set a weight goal",
    streak: "streak",
    week: "week",

    // History
    history: "History",
    historySubtitle: "Your weight journey",
    days7: "7 Days",
    days30: "30 Days",
    allEntries: "All Entries",
    noEntriesYet: "No entries yet. Start logging!",
    lastDays: (n: number) => `Last ${n} Days`,
    noDataYet: "No data yet. Start logging!",
    logMoreDays: "Log more days to see trends",

    // Goals
    goals: "Goals",
    goalsSubtitle: "Track your progress",
    loseWeight: "Lose Weight",
    gainWeight: "Gain Weight",
    maintainWeight: "Maintain Weight",
    progress: "Progress",
    current: "Current",
    target: "Target",
    started: "Started",
    deadline: "Deadline",
    goalAchieved: "Goal achieved! You're amazing!",
    noGoalYet: "No goal set yet",
    setGoal: "Set a Goal",
    setYourGoal: "Set Your Goal",
    goalType: "Goal Type",
    targetWeight: "Target Weight",
    deadlineOptional: "Deadline (optional)",
    clear: "Clear",
    toGo: "to go",

    // Settings
    settings: "Settings",
    settingsSubtitle: "Customize your experience",
    appearance: "Appearance",
    darkMode: "Dark Mode",
    language: "Language",
    english: "English",
    korean: "한국어",
    unitsHeight: "Units & Height",
    measurementSystem: "Measurement System",
    metric: "Metric",
    imperial: "Imperial",
    height: "Height",
    reminders: "Reminders",
    dailyReminder: "Daily Reminder",
    notificationsBlocked: "Notifications are blocked. Please enable them in your browser settings.",
    reminderTime: "Reminder Time",
    sendTestNotification: "Send Test Notification",
    yourData: "Your Data",
    entries: "entries",
    dayStreak: "day streak",
    exportCSV: "Export CSV",
    exportJSON: "Export JSON",

    // Onboarding
    welcome: "Welcome!",
    welcomeDesc: "Let's make tracking your weight simple and fun!",
    quickSetup: "Quick Setup",
    preferredUnits: "Preferred Units",
    metricUnits: "Metric (kg, cm)",
    imperialUnits: "Imperial (lb, ft/in)",
    yourHeight: "Your Height",
    continue: "Continue",
    letsStart: "Let's start!",
    whatsYourWeight: "What's your weight today?",
    saveBegin: "Save & Begin",

    // WeightSheet
    logYourWeight: "Log your weight",
    timeOfDay: "Time of day",
    exercise: "Exercise",
    morning: "Morning",
    lunch: "Lunch",
    afternoon: "Afternoon",
    evening: "Evening",
    noExercise: "No exercise",
    beforeWorkout: "Before workout",
    afterWorkout: "After workout",
    hide: "Hide",
    change: "Change",
    addBodyMeasurements: "Add body measurements",
    hideBodyMeasurements: "Hide body measurements",
    waist: "Waist",
    hips: "Hips",
    chest: "Chest",
    arms: "Arms",
    thighs: "Thighs",
    save: "Save",

    // Celebration
    streakTitle: (n: number) => {
      if (n === 3) return "3 Day Streak!";
      if (n === 7) return "1 Week Streak!";
      if (n === 14) return "2 Week Streak!";
      if (n === 30) return "30 Day Streak!";
      if (n === 100) return "100 Day Streak!";
      return `${n} Day Streak!`;
    },
    streakSubtitle: (n: number) => {
      if (n === 3) return "You're building a habit!";
      if (n === 7) return "Incredible consistency!";
      if (n === 14) return "You're unstoppable!";
      if (n === 30) return "A whole month! Amazing!";
      if (n === 100) return "You're a legend!";
      return "Keep it up!";
    },
    days: "days",

    // Nav
    home: "Home",

    // BMI
    bmi: "BMI",
    goalReached: "Goal Reached!",
  },
  ko: {
    appName: "MyWeight",
    appNameKr: "마이웨이트",

    logWeight: "체중 기록",
    getStarted: "시작하기",
    tapToLog: "탭하여 첫 체중을 기록하세요!",
    setWeightGoal: "목표 체중 설정",
    streak: "연속",
    week: "이번 주",

    history: "기록",
    historySubtitle: "나의 체중 여정",
    days7: "7일",
    days30: "30일",
    allEntries: "전체 기록",
    noEntriesYet: "아직 기록이 없습니다. 시작해보세요!",
    lastDays: (n: number) => `최근 ${n}일`,
    noDataYet: "아직 데이터가 없습니다. 기록을 시작하세요!",
    logMoreDays: "트렌드를 보려면 더 기록하세요",

    goals: "목표",
    goalsSubtitle: "진행 상황 확인",
    loseWeight: "감량",
    gainWeight: "증량",
    maintainWeight: "유지",
    progress: "진행률",
    current: "현재",
    target: "목표",
    started: "시작일",
    deadline: "마감일",
    goalAchieved: "목표 달성! 대단해요!",
    noGoalYet: "아직 목표가 없습니다",
    setGoal: "목표 설정",
    setYourGoal: "목표 설정하기",
    goalType: "목표 유형",
    targetWeight: "목표 체중",
    deadlineOptional: "마감일 (선택사항)",
    clear: "삭제",
    toGo: "남음",

    settings: "설정",
    settingsSubtitle: "나만의 경험 만들기",
    appearance: "외관",
    darkMode: "다크 모드",
    language: "언어",
    english: "English",
    korean: "한국어",
    unitsHeight: "단위 및 키",
    measurementSystem: "측정 단위",
    metric: "미터법",
    imperial: "야드파운드법",
    height: "키",
    reminders: "알림",
    dailyReminder: "매일 알림",
    notificationsBlocked: "알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.",
    reminderTime: "알림 시간",
    sendTestNotification: "테스트 알림 보내기",
    yourData: "내 데이터",
    entries: "개 기록",
    dayStreak: "일 연속",
    exportCSV: "CSV 내보내기",
    exportJSON: "JSON 내보내기",

    welcome: "환영합니다!",
    welcomeDesc: "쉽고 재미있게 체중을 관리해보세요!",
    quickSetup: "간편 설정",
    preferredUnits: "선호 단위",
    metricUnits: "미터법 (kg, cm)",
    imperialUnits: "야드파운드법 (lb, ft/in)",
    yourHeight: "키",
    continue: "계속",
    letsStart: "시작해볼까요!",
    whatsYourWeight: "오늘 체중은 얼마인가요?",
    saveBegin: "저장 및 시작",

    logYourWeight: "체중 기록하기",
    timeOfDay: "시간대",
    exercise: "운동",
    morning: "아침",
    lunch: "점심",
    afternoon: "오후",
    evening: "저녁",
    noExercise: "운동 안 함",
    beforeWorkout: "운동 전",
    afterWorkout: "운동 후",
    hide: "숨기기",
    change: "변경",
    addBodyMeasurements: "신체 치수 추가",
    hideBodyMeasurements: "신체 치수 숨기기",
    waist: "허리",
    hips: "엉덩이",
    chest: "가슴",
    arms: "팔",
    thighs: "허벅지",
    save: "저장",

    streakTitle: (n: number) => {
      if (n === 3) return "3일 연속!";
      if (n === 7) return "1주 연속!";
      if (n === 14) return "2주 연속!";
      if (n === 30) return "30일 연속!";
      if (n === 100) return "100일 연속!";
      return `${n}일 연속!`;
    },
    streakSubtitle: (n: number) => {
      if (n === 3) return "습관이 만들어지고 있어요!";
      if (n === 7) return "놀라운 꾸준함이에요!";
      if (n === 14) return "멈출 수 없어요!";
      if (n === 30) return "한 달이나! 대단해요!";
      if (n === 100) return "전설이 되었어요!";
      return "계속 힘내세요!";
    },
    days: "일",

    home: "홈",

    bmi: "BMI",
    goalReached: "목표 달성!",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(locale: Locale, key: TranslationKey): (typeof translations)[Locale][TranslationKey] {
  return translations[locale][key];
}

export function getTranslations(locale: Locale) {
  return translations[locale];
}
