export const SYSTEM_PROMPT = `You are an AI assistant for a productivity app called Taskify.
Your role is to help users achieve their goals by creating structured plans.

Available Actions:
- Create todos with categories, priorities, and due dates
- Create meal plans with duration and meals
- Create workout plans with weekly schedules and exercises
- Create habits with tracking (daily, weekly, monthly)
- Create journal entries with tags

When a user expresses a goal:
1. Understand their intent and extract key information
2. Ask clarifying questions if needed
3. Generate a comprehensive, actionable plan
4. Structure data according to the API schemas

Be conversational, encouraging, and specific. Always provide realistic, achievable plans.`;

export const INTENT_RECOGNITION_PROMPT = `Analyze the user's message and extract their intent.

Identify:
1. Goal Type (weight_loss, fitness, productivity, habit_creation, meal_planning, etc.)
2. Target (if specified, e.g., "lose 10kg")
3. Duration (if specified, e.g., "6 months")
4. Required information still needed

Respond in JSON format:
{
  "goalType": "string",
  "target": { "value": number, "unit": "string" } or null,
  "duration": { "value": number, "unit": "string" } or null,
  "requiredInfo": ["info1", "info2"],
  "category": "auto-generated-category-name"
}

User message: `;

export const QUESTION_GENERATION_PROMPT = `Based on the user's goal and missing information, generate 3-5 follow-up questions.

Questions should be:
- Specific and relevant
- Easy to answer
- Help create a better plan

Format each question with appropriate type:
- "text" for open-ended
- "number" for numeric input
- "select" for single choice
- "multi_select" for multiple choices
- "slider" for range selection

Respond in JSON format:
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text?",
      "type": "text|number|select|multi_select|slider",
      "options": ["option1", "option2"] (if select/multi_select),
      "min": number (if slider/number),
      "max": number (if slider/number),
      "required": boolean,
      "placeholder": "hint text"
    }
  ]
}

Intent: `;

export const PLAN_GENERATION_PROMPT = `Based on the user's goal and their answers, generate a comprehensive action plan.

Create specific, actionable items for:
- Todos: Break down the goal into trackable tasks
- Habits: Daily/weekly habits to support the goal
- Meal Plan (if health/fitness related): Structured eating plan with realistic meals and foods
- Workout Plan (if fitness related): Exercise schedule with proper exercises and weekly distribution
- Journal Entries: Reflection prompts and goal tracking

For Meal Plans:
- Include 3-4 meals per day (breakfast, lunch, dinner, optional snack)
- Each meal should have 2-4 realistic food items with proper nutritional values
- Use common, accessible foods
- Set realistic calorie counts (breakfast: 300-500, lunch: 400-600, dinner: 500-700, snack: 100-200)
- Duration should be in weeks (1-52 weeks), not days

For Workout Plans:
- Include 4-8 exercises per plan
- Each exercise needs sets (1-4) and either reps (8-20) OR duration (in seconds)
- For rep-based exercises: include reps field, omit duration field
- For duration-based exercises: include duration field, omit reps field
- Use common exercises (push-ups, squats, planks, etc.)
- Distribute exercises across the week (e.g., 3-4 days of strength training)
- Include rest days in the weekly schedule
- Generate unique exercise IDs for each exercise (format: "ex_timestamp_random")
- The weeklySchedule should contain exercise IDs (not names) in the arrays for each day
- Example: "monday": ["ex_1234567890_abc123", "ex_1234567891_def456"], "tuesday": ["ex_1234567892_ghi789"], "wednesday": []
- Duration should be in weeks (1-52 weeks), not days

Respond in JSON format:
{
  "summary": "Brief description of the plan",
  "category": "unique-identifier-for-this-plan",
  "actions": [
    {
      "type": "create_todos",
      "count": number,
      "preview": ["Todo 1", "Todo 2", "..."],
      "data": [
        {
          "title": "string",
          "description": "string",
          "priority": "low|medium|high",
          "dueDate": "YYYY-MM-DD (use current date + 7 days as default)",
          "category": "plan-category"
        }
      ]
    },
    {
      "type": "create_habits",
      "count": number,
      "preview": ["Habit 1", "Habit 2"],
      "data": [
        {
          "name": "string",
          "description": "string",
          "category": "plan-category",
          "frequency": "daily|weekly|monthly"
        }
      ]
    },
    {
      "type": "create_meal_plan",
      "count": 1,
      "preview": { "name": "string", "duration": number },
      "data": {
        "name": "string",
        "description": "string",
        "meals": [
          {
            "id": "meal_timestamp_random",
            "name": "string",
            "type": "breakfast|lunch|dinner|snack",
            "foods": [
              {
                "id": "food_timestamp_random",
                "name": "string",
                "quantity": "string",
                "calories": number,
                "protein": number,
                "carbs": number,
                "fat": number
              }
            ],
            "calories": number,
            "notes": "string"
          }
        ],
        "duration": number (in weeks, 1-52)
      }
    },
    {
      "type": "create_workout_plan",
      "count": 1,
      "preview": { "name": "string", "duration": number },
      "data": {
        "name": "string",
        "description": "string",
        "exercises": [
          {
            "id": "ex_timestamp_random",
            "name": "string",
            "sets": number (1-4),
            "reps": number (8-20, for rep-based exercises only),
            "duration": number (15-60 seconds, for duration-based exercises only),
            "notes": "string"
          }
        ],
        "weeklySchedule": {
          "sunday": ["ex_timestamp_random1", "ex_timestamp_random2"],
          "monday": ["ex_timestamp_random3"],
          "tuesday": [],
          "wednesday": ["ex_timestamp_random1", "ex_timestamp_random4"],
          "thursday": ["ex_timestamp_random2", "ex_timestamp_random5"],
          "friday": ["ex_timestamp_random3", "ex_timestamp_random6"],
          "saturday": []
        },
        "duration": number (in weeks, 1-52)
      }
    },
    {
      "type": "create_journal",
      "count": number,
      "preview": ["Entry 1", "Entry 2"],
      "data": [
        {
          "title": "string",
          "content": "string",
          "tags": ["tag1", "tag2"]
        }
      ]
    }
  ]
}

User Goal and Answers: `;
