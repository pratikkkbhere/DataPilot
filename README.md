# DataPilot – Self-Service Data Analyst Platform


**Enterprise-Grade Data Analytics Without Code**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)


---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Complete Workflow](#-complete-workflow)
- [Data Cleaning Logic](#-data-cleaning-logic)
- [SQL Engine & Query Capabilities](#-sql-engine--query-capabilities)
- [Technology Stack](#-technology-stack)
- [Data Quality & Enterprise Features](#-data-quality--enterprise-features)
- [UI/UX Design Decisions](#-uiux-design-decisions)
- [Security & Governance](#-security--governance)
- [Limitations](#-limitations)
- [Future Enhancements](#-future-enhancements)
- [Resume & Interview Guide](#-how-this-project-demonstrates-professional-skills)

---

## 🎯 Project Overview

### What is DataPilot?

DataPilot is a **self-service data analytics platform** designed to empower Data Analysts, Business Analysts, and Operations teams to perform end-to-end data workflows without writing a single line of code. The platform transforms raw datasets into actionable insights through an intuitive, guided interface.

### Target Users

| Role                  | Use Case                                                                  |
| --------------------- | ------------------------------------------------------------------------- |
| **Data Analysts**     | Profiling, cleaning, and aggregating datasets for reporting               |
| **Business Analysts** | Creating pivot summaries and visualizations for stakeholder presentations |
| **Operations Teams**  | Validating data quality before pipeline ingestion                         |
| **Product Managers**  | Quick exploratory analysis on user behavior data                          |
| **Finance Teams**     | Reconciliation and anomaly detection in transactional data                |

### The Problem It Solves

In enterprise environments, analysts face recurring challenges:

1. **Tool Fragmentation** – Switching between Excel, Python notebooks, SQL clients, and BI tools for a single analysis
2. **Technical Barriers** – Writing code for routine cleaning and aggregation tasks
3. **Audit Gaps** – Lack of transformation history and reproducibility
4. **Time Consumption** – Manual data profiling that delays insight generation

DataPilot consolidates the entire analyst workflow into a **single, browser-based application** with full transparency and control.

### Enterprise Relevance

- **Standardized Workflows**: Ensures consistent data handling across teams
- **Reduced Onboarding Time**: New analysts can be productive within minutes
- **Audit-Ready**: Every transformation is logged and reversible
- **No Infrastructure Required**: Runs entirely in the browser with zero backend dependencies for data processing

---

### How We Accelerated Development

| Capability                    | How It Was Used                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **UI Component Generation**   | Complex data tables, modals, and configuration panels were generated from detailed prompts                           |
| **State Management**          | Session-based dataset state, cleaning history, and workflow progression were implemented through iterative prompting |
| **Design System Integration** | Shadcn/UI components with Tailwind CSS were automatically configured with proper theming                             |
| **Rapid Iteration**           | Features like the Missing Value Configuration panel were refined through prompt-driven adjustments                   |
| **Code Quality**              | Generated TypeScript code with proper type definitions and component separation                                      |

### Benefits Realized

- **Development Speed**: Core platform built in days instead of weeks
- **Consistent Architecture**: Clean separation of concerns across components
- **Production Quality**: Generated code follows React best practices
- **Scalable Foundation**: Easy to extend with additional features through continued prompting

---

## 🔄 Complete Workflow

DataPilot implements an **8-step analyst workflow** designed to mirror real-world data processing pipelines:

```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ IMPORT  │ → │ PROFILE │ → │  CLEAN  │ → │ FILTER  │
└─────────┘   └─────────┘   └─────────┘   └─────────┘
                                               │
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ EXPORT  │ ← │VISUALIZE│ ← │AGGREGATE│ ← │   SQL   │
└─────────┘   └─────────┘   └─────────┘   └─────────┘
```

### Step 1: Import

**Purpose**: Ingest raw data from CSV or Excel files

**Technical Implementation**:

- File parsing via PapaParse (CSV) and SheetJS (Excel)
- Automatic schema detection and type inference
- Memory-efficient chunked reading for large files
- Preview of first 50 rows for validation

**User Experience**:

- Drag-and-drop upload zone with visual feedback
- Immediate file validation with error messaging
- Support for `.csv`, `.xlsx`, and `.xls` formats

### Step 2: Profile

**Purpose**: Generate comprehensive statistical analysis of the dataset

**Automatic Analysis**:

| Metric             | Numeric Columns | Categorical Columns | Date Columns |
| ------------------ | --------------- | ------------------- | ------------ |
| Count              | ✓               | ✓                   | ✓            |
| Missing %          | ✓               | ✓                   | ✓            |
| Unique Values      | ✓               | ✓                   | ✓            |
| Min/Max            | ✓               | –                   | ✓            |
| Mean/Median        | ✓               | –                   | –            |
| Mode               | ✓               | ✓                   | –            |
| Standard Deviation | ✓               | –                   | –            |

**Dataset-Level Summary**:

- Total rows and columns
- Overall missing percentage
- Duplicate row count
- Data quality score (0-100)

### Step 3: Clean

**Purpose**: Handle data quality issues with user-controlled strategies

**Capabilities**:

- Missing value configuration (per-column)
- Duplicate row removal
- Text normalization (trimming, case standardization)
- Data type correction
- Date format normalization

**Key Feature**: All cleaning operations require explicit user confirmation with preview before application.

### Step 4: Filter & Sort

**Purpose**: Subset and order data for focused analysis

**Filtering Options**:

- Equality and comparison operators (`=`, `!=`, `>`, `<`, `>=`, `<=`)
- Range filtering (`BETWEEN`)
- Pattern matching (`CONTAINS`, `STARTS WITH`, `ENDS WITH`)
- Null/Not Null filtering
- Date range selection

**Sorting Options**:

- Single and multi-column sorting
- Ascending/Descending toggle
- Drag-and-drop sort priority

### Step 5: SQL Query

**Purpose**: Execute SQL queries directly on the dataset

**Query Modes**:

1. **Visual Query Builder**: Point-and-click query construction
2. **SQL Editor**: Full SQL syntax with syntax highlighting
3. **Templates**: Pre-built queries from basic to advanced

**Supported SQL Features**:

- Standard SELECT with column selection
- WHERE clauses with complex conditions
- GROUP BY with HAVING filters
- ORDER BY with multiple columns
- LIMIT for result pagination
- Aggregate functions (COUNT, SUM, AVG, MIN, MAX)

### Step 6: Aggregate

**Purpose**: Create summary statistics and pivot-style tables

**Aggregation Options**:

- Group by single or multiple columns
- Multiple aggregation metrics per column
- Pivot table generation
- Running totals and percentages

### Step 7: Visualize

**Purpose**: Generate charts and graphs from data

**Chart Types**:

- Bar charts (vertical/horizontal)
- Line charts with trend analysis
- Pie and donut charts
- Histograms for distribution analysis
- Scatter plots for correlation
- Heatmaps for multi-dimensional analysis

**Customization**:

- Axis selection (X, Y, grouping)
- Color schemes aligned with theme
- Legend positioning
- Export as PNG/SVG

### Step 8: Export

**Purpose**: Download processed data and visualizations

**Export Formats**:

- Cleaned dataset (CSV)
- Cleaned dataset (Excel)
- SQL query results (CSV/Excel)
- Chart images (PNG)
- Full analysis report

---

## 🧹 Data Cleaning Logic

### Missing Value Configuration

DataPilot provides **explicit, user-controlled** missing value handling rather than automatic imputation.

#### Configuration by Data Type

**Numeric Columns**:

```
○ Leave as NULL (no action)
○ Fill with Mean
○ Fill with Median
○ Fill with Mode
○ Fill with Custom Value [____]
○ Drop rows with missing values
```

**Categorical Columns**:

```
○ Leave as NULL (no action)
○ Fill with Mode
○ Fill with Custom Value (e.g., "Unknown")
○ Drop rows with missing values
```

**Date Columns**:

```
○ Leave as NULL (no action)
○ Fill with Earliest Date
○ Fill with Latest Date
○ Fill with Custom Date [📅]
○ Drop rows with missing values
```

#### Preview Before Apply

Before any changes are applied, users see a summary:

```
Pending Changes:
• 120 missing values in 'age' will be filled with Median (32)
• 45 missing values in 'city' will be filled with "Unknown"
• 15 rows will be removed due to missing 'order_date'

[Cancel] [Apply Changes]
```

### Duplicate Detection

- Exact row matching across all columns
- Option to keep first, last, or remove all duplicates
- Preview of duplicate groups before removal

### Data Type Correction

| Detection                         | Correction            |
| --------------------------------- | --------------------- |
| Numeric strings ("123")           | Convert to number     |
| Date strings ("2024-01-15")       | Parse to Date object  |
| Boolean-like ("true", "yes", "1") | Convert to boolean    |
| Currency ("$1,234.56")            | Extract numeric value |

### Cleaning Summary

Every cleaning operation is logged:

```
✔ age → filled 120 missing values with Median (32)
✔ city → filled 45 missing values with "Unknown"
✔ order_date → removed 15 rows with missing values
✔ Removed 23 duplicate rows
✔ Trimmed whitespace in 5 text columns
```

---

## 🔍 SQL Engine & Query Capabilities

### Architecture

DataPilot uses **AlaSQL**, an in-memory SQL database engine, to enable SQL querying directly on uploaded datasets.

```typescript
// Dataset initialization
initializeDataset(data: DataRow[]): void
// Creates table 'dataset' with uploaded data

// Query execution
executeQuery(sql: string): SQLQueryResult
// Returns results, columns, row count, execution time
```

### Table Creation

When a dataset is uploaded:

1. Data is parsed into row objects
2. Column types are inferred
3. An in-memory table named `dataset` is created
4. SQL queries reference this table

### Query Execution Flow

```
User Input → Validation → Parsing → Execution → Result Formatting
     │            │           │          │              │
     │      Security      AlaSQL     Row/Column     Display
     │       Check        Engine      Metadata      + Export
     │            │           │          │              │
     └────────────┴───────────┴──────────┴──────────────┘
```

### Supported SQL Features

| Category        | Features                                                 |
| --------------- | -------------------------------------------------------- |
| **Selection**   | `SELECT`, `SELECT DISTINCT`, `*`, column aliases         |
| **Filtering**   | `WHERE`, `AND`, `OR`, `IN`, `BETWEEN`, `LIKE`, `IS NULL` |
| **Grouping**    | `GROUP BY`, `HAVING`                                     |
| **Ordering**    | `ORDER BY ASC/DESC`, multi-column sorting                |
| **Limiting**    | `LIMIT`, `OFFSET`                                        |
| **Aggregates**  | `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `COUNT DISTINCT`    |
| **Expressions** | Arithmetic operators, string functions                   |

### SQL Templates

**Basic**:

```sql
SELECT * FROM dataset LIMIT 100
SELECT column1, column2 FROM dataset WHERE condition
```

**Intermediate**:

```sql
SELECT category, COUNT(*) as count, AVG(amount) as avg_amount
FROM dataset
GROUP BY category
ORDER BY count DESC
```

**Advanced**:

```sql
SELECT category,
       SUM(amount) as total,
       SUM(amount) * 100.0 / SUM(SUM(amount)) OVER () as percentage
FROM dataset
GROUP BY category
HAVING SUM(amount) > 1000
```

### Integration with Visualization

SQL query results automatically populate:

- Chart Builder with detected columns
- Export options for result download
- Pagination for large result sets

---

## 🛠 Technology Stack

### Core Technologies

| Layer          | Technology       | Purpose                       |
| -------------- | ---------------- | ----------------------------- |
| **Language**   | TypeScript 5.x   | Type-safe development         |
| **Framework**  | React 18.3       | Component-based UI            |
| **Build Tool** | Vite 5.x         | Fast development and bundling |
| **Styling**    | Tailwind CSS 3.4 | Utility-first styling         |
| **Components** | Shadcn/UI        | Accessible component library  |

### Data Processing Libraries

| Library            | Version | Purpose                          |
| ------------------ | ------- | -------------------------------- |
| **PapaParse**      | 5.5.x   | CSV parsing with streaming       |
| **SheetJS (xlsx)** | 0.18.x  | Excel file reading/writing       |
| **AlaSQL**         | 4.x     | In-memory SQL engine             |
| **date-fns**       | 3.x     | Date manipulation and formatting |

### Visualization

| Library          | Purpose                      |
| ---------------- | ---------------------------- |
| **Recharts**     | React-based charting library |
| **Lucide React** | Icon system                  |

### State Management

- React useState/useEffect for local state
- Session-based dataset persistence
- No external state library required

### Development Platform

| Tool        | Role               |
| ----------- | ------------------ |
| **Git**     | Version control    |
| **npm/bun** | Package management |

---

## 📊 Data Quality & Enterprise Features

### Data Quality Score

A composite score (0-100) calculated from:

| Factor       | Weight | Calculation                  |
| ------------ | ------ | ---------------------------- |
| Completeness | 40%    | `100 - missing_percentage`   |
| Uniqueness   | 30%    | `100 - duplicate_percentage` |
| Validity     | 20%    | Type consistency score       |
| Consistency  | 10%    | Format uniformity            |

### Validation Rules

- Column type enforcement
- Range validation for numeric fields
- Date format consistency
- Required field checks

### Dataset Versioning

| State            | Description                     |
| ---------------- | ------------------------------- |
| **Original**     | Immutable copy of uploaded data |
| **Cleaned**      | Current working dataset         |
| **Query Result** | Output from SQL execution       |

### Undo/Revert Capability

- **Reset to Original**: Discard all transformations
- **Cleaning History**: Full log of applied operations
- **Step-by-step Rollback**: Planned for future release

### Transformation History

Every operation is logged with:

- Timestamp
- Operation type
- Affected columns
- Row count impact
- Before/after preview

### Theme Support

- **Light Mode**: Optimized for office environments
- **Dark Mode**: Reduced eye strain for extended analysis
- **System Preference**: Automatic detection

---

## 🎨 UI/UX Design Decisions

### Sidebar-Based Workflow

A vertical workflow stepper guides users through each stage:

```
┌──────────────────┐
│ ○ Import         │ ← Current step highlighted
│ ● Profile        │
│ ○ Clean          │
│ ○ Filter & Sort  │
│ ○ SQL Query      │
│ ○ Aggregate      │
│ ○ Visualize      │
│ ○ Export         │
└──────────────────┘
```

### Progressive Disclosure

| Level            | Features Shown                    |
| ---------------- | --------------------------------- |
| **Basic**        | Upload, preview, simple filters   |
| **Intermediate** | Cleaning config, aggregations     |
| **Advanced**     | SQL editor, custom visualizations |

### Analyst-Friendly Controls

- **Tables**: Sortable headers, resizable columns, pagination
- **Filters**: Intuitive operators, date pickers, range sliders
- **Forms**: Clear labels, helper text, validation feedback

### Preview-Before-Apply Philosophy

**Every destructive or transformative action requires**:

1. Configuration selection
2. Impact preview
3. Explicit confirmation

This prevents accidental data loss and ensures audit compliance.

---

## 🔒 Security & Governance

### Design Principles

| Principle                       | Implementation                                |
| ------------------------------- | --------------------------------------------- |
| **Dataset Isolation**           | Each session operates on isolated data copies |
| **Read-Only Source**            | Original uploaded file is never modified      |
| **Controlled Transformations**  | All changes require user confirmation         |
| **No Auto-Destructive Actions** | Deletions always require explicit approval    |

### Data Handling

- **Client-Side Processing**: Data never leaves the browser
- **No Persistence**: Datasets are cleared on session end
- **No External Transmission**: No data sent to external servers

### Audit Trail

Every transformation includes:

- User action timestamp
- Operation details
- Affected row/column counts
- Reversibility status

---

## ⚠️ Limitations

### Current Scope

| Limitation           | Reason                                              |
| -------------------- | --------------------------------------------------- |
| **File Size**        | Browser memory constraints (~100MB practical limit) |
| **No ML/AI**         | Focus on explainable, deterministic operations      |
| **Single User**      | No multi-user collaboration in current version      |
| **No Cloud Storage** | Session-based only                                  |
| **Limited SQL**      | Subset of ANSI SQL supported by AlaSQL              |

### Intentional Exclusions

- **Machine Learning Models**: Avoided to maintain explainability
- **Predictive Analytics**: Outside scope of data preparation focus
- **Real-Time Data**: Designed for batch file analysis
- **Database Connections**: File-based input only

---

## 🚀 Future Enhancements

### Planned Features

| Feature               | Priority | Description                                      |
| --------------------- | -------- | ------------------------------------------------ |
| **Collaboration**     | High     | Shared workspaces, comments, version history     |
| **Cloud Integration** | High     | Connect to S3, GCS, Azure Blob                   |
| **Data Warehouses**   | Medium   | Direct BigQuery, Snowflake, Redshift connections |
| **Scheduling**        | Medium   | Automated report generation                      |
| **RBAC**              | Medium   | Role-based access control                        |
| **API Access**        | Low      | Programmatic dataset operations                  |
| **Custom Formulas**   | Low      | User-defined calculated columns                  |

### Technical Roadmap

1. **Supabase Integration**: Persistent storage and user authentication
2. **Edge Functions**: Server-side processing for large datasets
3. **Real-Time Sync**: Collaborative editing capabilities
4. **Export Templates**: Branded report generation

---

## 💼 How This Project Demonstrates Professional Skills

### Technical Competencies

| Skill                    | Evidence                                               |
| ------------------------ | ------------------------------------------------------ |
| **Frontend Development** | React, TypeScript, component architecture              |
| **Data Engineering**     | ETL workflows, data validation, type handling          |
| **SQL Proficiency**      | Query building, optimization, in-memory execution      |
| **UX Design**            | Workflow design, progressive disclosure, accessibility |

### Enterprise-Ready Qualities

- **Audit Compliance**: Full transformation logging
- **Data Governance**: Controlled, explicit operations
- **Scalable Architecture**: Component-based, easily extensible
- **Professional UI**: Enterprise-appropriate design language

### Real Analyst Workflow Alignment

This project mirrors actual tools used in enterprise environments:

- Similar to **Alteryx** for data preparation workflows
- Comparable to **Tableau Prep** for visual data cleaning
- Aligned with **Power Query** for transformation logic

### Interview Talking Points

1. **Problem Solving**: "I identified fragmented analyst tooling as a key pain point and built a unified solution"
2. **Technical Depth**: "The platform uses an in-memory SQL engine to enable ad-hoc querying without backend infrastructure"
3. **User Empathy**: "Every feature was designed around the principle of explicit user control and preview-before-apply"
4. **Modern Development**: "I leveraged AI-assisted development to rapidly iterate while maintaining production-quality code"

---

## 📄 License

This project was built for demonstration and portfolio purposes.

---

<div align="center">

Built with ❤️

_Transforming how analysts work with data_

</div>
