export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "active" | "completed" | "on-hold";
  startDate: Date;
  endDate?: Date;
  budget?: number;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  documents?: Document[];
  tasks?: Task[];
  milestones?: Milestone[];
  categories?: Category[];
}

export interface Document {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  category: string;
  subcategory?: string;
  revision?: string;
  description?: string;
  extractedText?: string;
  metadata?: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  annotations?: Annotation[];
  comments?: Comment[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  count: number;
  projectId: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  assigneeId?: string;
  projectId: string;
  parentId?: string;
  subtasks?: Task[];
  comments?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  projectId: string;
  createdAt: Date;
}

export interface Annotation {
  id: string;
  content: string;
  x: number;
  y: number;
  page: number;
  color: string;
  documentId: string;
  authorName?: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  authorName: string;
  documentId?: string;
  taskId?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  link?: string;
  createdAt: Date;
}

export interface SearchResult {
  id: string;
  type: "document" | "task" | "annotation";
  title: string;
  snippet: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface DashboardStats {
  totalDocuments: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  categories: { name: string; count: number; color: string }[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: "document_added" | "task_completed" | "comment_added" | "milestone_reached";
  title: string;
  description: string;
  timestamp: Date;
}
