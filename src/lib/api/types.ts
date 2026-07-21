export type SuccessEnvelope<T> = {
  success: true;
  data: T;
};

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  isPremium: boolean;
  role: string;
};

export type AuthMe = {
  user: {
    userId?: number;
    id?: number;
    email?: string;
    role?: string;
    sessionId?: string;
  };
};

export type AuthSuccess = {
  user: AuthUser;
  requiresOTP: false;
  message?: string;
};

export type AuthChallengeTiming = {
  otpExpiresAt?: string;
  resendAvailableAt?: string;
};

export type AuthChallenge = {
  requiresOTP: true;
  verificationType: "EMAIL_VERIFICATION" | "DEVICE_REGISTRATION";
  message: string;
} & AuthChallengeTiming;

export type AuthMessage = {
  message: string;
};

export type VerificationResendResponse = AuthMessage & AuthChallengeTiming;

export type DeviceFingerprintPayload = {
  installationId?: string;
  deviceId?: string;
  deviceName?: string;
  platform?: string;
  platformVersion?: string;
  osName?: string;
  osVersion?: string;
  browserName?: string;
  browserVersion?: string;
  model?: string;
  manufacturer?: string;
  appVersion?: string;
  language?: string;
  timezone?: string;
  vendor?: string;
  fingerprintSeed?: string;
  userAgent?: string;
  screenWidth?: number;
  screenHeight?: number;
  colorDepth?: number;
  pixelRatio?: number;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  maxTouchPoints?: number;
};

export type LoginPayload = {
  email: string;
  password: string;
  deviceId?: string;
  deviceName?: string;
  device?: DeviceFingerprintPayload;
};

export type SignupPayload = {
  email: string;
  password: string;
  fullName: string;
  institutionCode?: string;
  aspiringCourse?: string;
  targetScore?: number;
  deviceId?: string;
  deviceName?: string;
  device?: DeviceFingerprintPayload;
};

export type VerifyOtpPayload = {
  email: string;
  otp: string;
  deviceId?: string;
  deviceName?: string;
  device?: DeviceFingerprintPayload;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type InstitutionContext = {
  id: number;
  code: string;
  name: string;
  slug: string;
  studyModeEnabled?: boolean;
  source?: "explicit" | "user_target" | "launch_default";
};

export type UserProfile = {
  id: number;
  email: string;
  fullName: string;
  isVerified: boolean;
  role: string;
  aspiringCourse?: string | null;
  targetScore?: number | null;
  isPremium: boolean;
  subscriptionEndDate?: string | null;
  deviceAccessMode?: "FREE" | "PREMIUM";
  emailUnsubscribed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserStats = {
  institution: InstitutionContext;
  totalSp: number;
  weeklySp: number;
  currentStreak: number;
  longestStreak: number;
  streakFreezesAvailable: number;
  realExamsCompleted: number;
  completedCollaborationExams: number;
  hasTakenFreeExam: boolean;
  aiExplanationsUsedToday: number;
  isPremium: boolean;
  deviceAccessMode: "FREE" | "PREMIUM";
  completedExams: number;
  abandonedExams: number;
  inProgressExams: number;
  bookmarkedQuestions: number;
  activeSessions: number;
  registeredPremiumDevices: number;
};

export type StreakSummary = {
  currentStreak: number;
  longestStreak: number;
  status: string;
  studiedToday: boolean;
  studiedYesterday: boolean;
  lastActivityDate: string | null;
  streakEndsAt: string | null;
  canStillSaveToday: boolean;
  streakFreezesAvailable: number;
  freezerProtectionActive: boolean;
  today: {
    examsTaken: number;
    spEarnedToday: number;
  };
  nextMilestone: {
    days: number;
    label: string;
    reward: string;
    remainingDays: number;
  } | null;
  milestones: Array<{
    days: number;
    label: string;
    reward: string;
    achieved: boolean;
    active: boolean;
  }>;
};

export type ExamSummary = {
  id: number;
  examType: string;
  subjects: string[];
  sessionNumber: number;
  displayNameLong: string;
  displayNameShort: string;
  totalQuestions: number;
  score: number;
  percentage: number;
  spEarned: number;
  status: string;
  isRetake: boolean;
  attemptNumber: number;
  retakesRemaining: number;
  startedAt: string;
  completedAt: string | null;
  timeTakenSeconds: number | null;
  collaborationSessionCode?: string | null;
};

// ─── Exam Session Types (for active exam-taking) ───

export type ExamQuestion = {
  id: number;
  questionText: string;
  hasImage: boolean;
  imageUrl: string | null;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string | null;
  optionAImageUrl: string | null;
  optionBImageUrl: string | null;
  optionCImageUrl: string | null;
  optionDImageUrl: string | null;
  optionEImageUrl: string | null;
  parentQuestionText: string | null;
  parentQuestionImageUrl: string | null;
  subject: string;
  topic: string | null;
};

export type ExamSessionData = {
  examId: number;
  examType: string;
  subjects: string[];
  sessionNumber: number;
  displayNameLong: string;
  displayNameShort: string;
  totalQuestions: number;
  timeAllowedSeconds: number;
  startedAt: string;
  expiresAt: string;
  questions: ExamQuestion[];
};

export type CollaborationQuestionSource =
  | "REAL_PAST_QUESTION"
  | "PRACTICE"
  | "MIXED";

export type CollaborationSessionType = "ONE_V_ONE_DUEL";

export type CollaborationSessionStatus =
  | "WAITING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type CollaborationParticipantState =
  | "JOINED"
  | "READY"
  | "DISCONNECTED"
  | "FINISHED";

export type CollaborationParticipant = {
  userId: number;
  fullName: string;
  participantState: CollaborationParticipantState;
  joinedAt: string;
  finishedAt: string | null;
  score: number | null;
  spEarned: number | null;
  finalRank: number | null;
};

export type CollaborationSession = {
  id: number;
  code: string;
  sessionType: CollaborationSessionType;
  status: CollaborationSessionStatus;
  sessionNumber: number;
  displayNameLong: string;
  displayNameShort: string;
  customName: string | null;
  effectiveDisplayName: string;
  questionSource: CollaborationQuestionSource;
  subjects: string[];
  totalQuestions: number;
  maxParticipants: number;
  hostUserId: number;
  startedAt: string | null;
  endedAt: string | null;
  participants: CollaborationParticipant[];
};

export type CollaborationSessionSnapshot = {
  session: CollaborationSession;
  myExamId?: number | null;
};

export type CollaborationExamAssignment = {
  userId: number;
  examId: number;
};

export type CollaborationStartResult = CollaborationSessionSnapshot & {
  questions: ExamQuestion[];
  examAssignments: CollaborationExamAssignment[];
  timeAllowedSeconds: number;
  startedAt: string;
  expiresAt: string;
};

export type AnswerInput = {
  questionId: number;
  answer: string | null;
  timeSpentSeconds?: number;
  isFlagged?: boolean;
};

export type SubmitExamPayload = {
  answers: AnswerInput[];
};

export type QuestionWithAnswer = ExamQuestion & {
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean;
  timeSpentSeconds: number | null;
  explanation?: {
    text: string;
    imageUrl: string | null;
    additionalNotes: string | null;
  } | null;
};

export type ExamResult = {
  examId: number;
  examType: string;
  subjects: string[];
  sessionNumber: number;
  displayNameLong: string;
  displayNameShort: string;
  totalQuestions: number;
  score: number;
  percentage: number;
  spEarned: number;
  spMultiplier: number;
  timeTakenSeconds: number;
  isRetake: boolean;
  attemptNumber: number;
  startedAt: string;
  completedAt: string;
  questions: QuestionWithAnswer[];
  stats: {
    totalSp: number;
    weeklySp: number;
    currentStreak: number;
  };
  autoBookmarkResult?: {
    attemptedCount: number;
    savedCount: number;
    limitReached: boolean;
  } | null;
};

export type ExamAbandonResult = {
  examId: number;
  status: string;
  message: string;
};

export type ExamHistory = {
  exams: ExamSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalExams: number;
    averageScore: number;
    totalSpEarned: number;
    bestScore: number;
  };
};

export type MyRank = {
  institution: InstitutionContext;
  user: {
    id: number;
    fullName: string;
    weeklySp: number;
    totalSp: number;
  };
  weekly: {
    rank: number | null;
    points: number;
    totalParticipants: number;
  };
  allTime: {
    rank: number | null;
    points: number;
    totalParticipants: number;
  };
};

// ─── Subscription Types ───

export type SubscriptionSnapshot = {
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  planType: string;
  amountPaidNaira: number;
  currency: string;
  autoRenew: boolean;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  lastPaymentReference: string | null;
};

export type SubscriptionStatus = {
  isPremium: boolean;
  planType: string;
  priceNaira: number;
  currency: string;
  durationMonths: number;
  currentSubscription: SubscriptionSnapshot | null;
};

export type InitiateSubscriptionPayload = {
  autoRenew: boolean;
};

export type InitiateSubscriptionResponse = {
  reference: string;
  checkoutUrl: string;
  accessCode: string;
  amountNaira: number;
  currency: string;
  planType: string;
  durationMonths: number;
  autoRenew: boolean;
  message: string;
};

export type VerifySubscriptionPayload = {
  reference: string;
};

export type VerifySubscriptionResponse = {
  activated: boolean;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "ABANDONED" | "REVERSED";
  message: string;
  subscription: SubscriptionSnapshot | null;
};

// ─── Bookmark Types ───

export type BookmarkLimits = {
  activeBookmarks: number;
  maxBookmarks: number;
  remainingBookmarks: number;
  expiryDays: number;
  accessTier: "FREE" | "PREMIUM";
};

export type BookmarkQuestion = {
  id: number;
  questionText: string;
  subject: string;
  topic: string | null;
  hasImage: boolean;
  imageUrl: string | null;
  optionA: string | null;
  optionAImageUrl: string | null;
  optionB: string | null;
  optionBImageUrl: string | null;
  optionC: string | null;
  optionCImageUrl: string | null;
  optionD: string | null;
  optionDImageUrl: string | null;
  optionE: string | null;
  optionEImageUrl: string | null;
  correctAnswer: string;
  parentQuestionText: string | null;
  parentQuestionImageUrl: string | null;
  explanation: {
    text: string;
    imageUrl: string | null;
    additionalNotes: string | null;
  } | null;
};

export type Bookmark = {
  id: number;
  questionId: number;
  examId: number | null;
  notes: string | null;
  createdAt: string;
  expiresAt: string | null;
  question: BookmarkQuestion;
};

export type BookmarksList = {
  bookmarks: Bookmark[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  limits: BookmarkLimits;
};

export type BookmarksSummary = {
  bookmarks: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  limits: BookmarkLimits;
};

export type CreateBookmarkPayload = {
  questionId: number;
  examId?: number;
  notes?: string;
};

export type UpdateBookmarkPayload = {
  notes: string | null;
};

export type BookmarkDeleteResult = {
  success: true;
  message: string;
};

// ─── Security Types ───

export type ActiveSession = {
  sessionId: string;
  deviceId: string;
  deviceName: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string | null;
  lastLoginAt: string | null;
  isCurrent: boolean;
  isRegisteredPremiumDevice: boolean;
  registrationMethod: string | null;
};

export type RegisteredDevice = {
  deviceId: string;
  deviceName: string;
  userAgent: string;
  createdAt: string;
  verifiedAt: string | null;
  lastLoginAt: string | null;
  isCurrent: boolean;
  isActive: boolean;
  registrationMethod: string | null;
};

export type SecurityOverview = {
  deviceAccessMode: "FREE" | "PREMIUM";
  currentSessionId: string;
  currentDeviceId: string;
  activeSessions: ActiveSession[];
  registeredPremiumDevices: RegisteredDevice[];
};

export type PasswordChangeResult = {
  success: true;
  message: string;
  changedAt: string;
  invalidatedSessions: number;
};

export type AccountDeleteResult = {
  success: true;
  message: string;
  deletedAt: string;
};

// ─── Mutation Payloads ───

export type UpdateProfilePayload = {
  fullName?: string;
  aspiringCourse?: string | null;
  targetScore?: number | null;
  emailUnsubscribed?: boolean;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

// ─── Achievement Types ───

export type Achievement = {
  key: string;
  title: string;
  description: string;
  category: string;
  unlocked?: boolean;
  unlockedAt?: string | null;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
};

// ─── Streak Calendar Types ───

export type StreakCalendarDay = {
  date: string;
  studied: boolean;
  examsTaken: number;
  spEarnedToday: number;
  isToday: boolean;
  isYesterday: boolean;
  isCurrentStreakDay: boolean;
};

export type StreakCalendar = {
  daysRequested: number;
  currentStreak: number;
  longestStreak: number;
  status: string;
  activeDaysInRange: number;
  totalSpEarnedInRange: number;
  days: StreakCalendarDay[];
};

// ─── Leaderboard Types ───

export type LeaderboardEntry = {
  rank: number;
  userId: number;
  fullName: string;
  points: number;
  weeklySp: number;
  totalSp: number;
  isCurrentUser: boolean;
};

export type Leaderboard = {
  type: "WEEKLY" | "ALL_TIME";
  institution: InstitutionContext;
  limit: number;
  generatedAt: string;
  totalParticipants: number;
  entries: LeaderboardEntry[];
};

// ─── Question Report Types ───

export type ReportIssueType =
  | "WRONG_ANSWER"
  | "TYPO"
  | "AMBIGUOUS"
  | "IMAGE_MISSING"
  | "OTHER";

export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED";

export type CreateReportPayload = {
  questionId: number;
  issueType: ReportIssueType;
  description?: string | null;
};

export type QuestionReport = {
  id: number;
  questionId: number;
  issueType: string;
  description: string | null;
  status: ReportStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  resolvedAt: string | null;
  question: {
    id: number;
    questionText: string;
    subject: string;
    topic: string | null;
    questionType: string;
    questionPool: string;
    hasImage: boolean;
    imageUrl: string | null;
  };
};

// Notifications

export type NotificationPreferences = {
  streaks: boolean;
  achievements: boolean;
  collaboration: boolean;
  subscription: boolean;
  reports: boolean;
  announcements: boolean;
};

export type NotificationSummaryCounts = {
  unreadActivityCount: number;
  unreadAnnouncementCount: number;
  totalUnreadCount: number;
};

export type ActivityNotification = {
  id: string;
  kind: string;
  category: string;
  priority: "LOW" | "DEFAULT" | "HIGH" | "URGENT";
  title: string;
  body: string;
  deeplink: string | null;
  payload: unknown;
  sourceType: string;
  sourceId: string | null;
  availableAt: string;
  expiresAt: string | null;
  readAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  isDismissed: boolean;
};

export type AnnouncementNotification = {
  id: string;
  title: string;
  body: string;
  deeplink: string | null;
  priority: "LOW" | "DEFAULT" | "HIGH" | "URGENT";
  audience: "ALL" | "PREMIUM" | "FREE";
  institutionId: number | null;
  institutionCode: string | null;
  institutionName: string | null;
  verifiedOnly: boolean;
  startAt: string;
  expiresAt: string | null;
  createdAt: string;
  isRead: boolean;
  isDismissed: boolean;
  readAt: string | null;
  dismissedAt: string | null;
};

export type NotificationsSummary = {
  counts: NotificationSummaryCounts;
  recentActivity: ActivityNotification[];
  activeAnnouncements: AnnouncementNotification[];
  preferences: NotificationPreferences;
};

export type NotificationsActivityList = {
  items: ActivityNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts: NotificationSummaryCounts;
};

export type NotificationsAnnouncementsList = {
  items: AnnouncementNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts: NotificationSummaryCounts;
};

export type NotificationPreferencesResponse = {
  preferences: NotificationPreferences;
};

export type NotificationActivityMutation = {
  notification: ActivityNotification;
  counts: NotificationSummaryCounts;
};

export type NotificationAnnouncementMutation = {
  announcement: AnnouncementNotification;
  counts: NotificationSummaryCounts;
};

export type NotificationsReadAllResponse = {
  updatedCount: number;
  counts: NotificationSummaryCounts;
};
