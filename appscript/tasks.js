/**
 * Gets all available task lists
 * @returns {Object} JSON response with task lists
 */
function getTaskLists() {
  try {
    const response = Tasks.Tasklists.list();
    const taskLists = response.items || [];

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      taskLists: taskLists.map(list => ({
        id: list.id,
        title: list.title
      }))
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Creates a new task list
 * @param {string} title - Title of the new task list
 * @returns {Object} JSON response with created task list
 */
function createTaskList(title) {
  try {
    if (!title) {
      throw new Error('Task list title is required');
    }

    const taskList = Tasks.Tasklists.insert({ title: title });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      taskList: {
        id: taskList.id,
        title: taskList.title
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Gets tasks from specified task lists within a date range
 * @param {string} startDateTime - Start date in 'MMMM D, YYYY HH:mm:ss' format
 * @param {string} endDateTime - End date in 'MMMM D, YYYY HH:mm:ss' format
 * @param {string[]} taskListIds - Optional array of specific task list IDs to check
 * @returns {Object} JSON response with tasks
 */
function getTasks(startDateTime = null, endDateTime = null, taskListIds = null) {
  try {
    // Handle case where parameters come from API endpoint
    if (typeof startDateTime === 'object' && startDateTime !== null) {
      // Check if it's an 'e' parameter object from doPost/doGet
      if (startDateTime.parameter) {
        const params = startDateTime;
        taskListIds = params.parameter.taskListIds;
        startDateTime = params.parameter.startDateTime;
        endDateTime = params.parameter.endDateTime;
      } else {
        // Handle direct object parameter call
        const params = startDateTime;
        taskListIds = params.taskListIds;
        startDateTime = params.startDateTime;
        endDateTime = params.endDateTime;
      }
    }

    // Convert taskListIds to array if it's a string or not an array
    if (taskListIds) {
      if (typeof taskListIds === 'string') {
        // Handle case where taskListIds might be a JSON string
        try {
          const parsed = JSON.parse(taskListIds);
          taskListIds = Array.isArray(parsed) ? parsed : [taskListIds];
        } catch (e) {
          taskListIds = [taskListIds];
        }
      } else if (!Array.isArray(taskListIds)) {
        taskListIds = [taskListIds];
      }
    }

    // Convert dates to RFC 3339 timestamp if provided
    const startDate = startDateTime ? new Date(startDateTime) : null;
    const endDate = endDateTime ? new Date(endDateTime) : null;

    let allTasks = [];
    let taskLists = [];

    // If no specific task lists provided, get all task lists
    if (!taskListIds) {
      const response = Tasks.Tasklists.list();
      taskLists = response.items || [];
    } else {
      // Use provided task list IDs
      taskListIds.forEach(id => {
        try {
          const taskList = Tasks.Tasklists.get(id);
          if (taskList) {
            taskLists.push(taskList);
          }
        } catch (e) {
          console.log(`Error getting task list ${id}: ${e.message}`);
        }
      });
    }

    if (taskLists.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        tasks: [],
        message: "No task lists found"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Iterate through task lists and get tasks
    taskLists.forEach(taskList => {
      try {
        const tasks = Tasks.Tasks.list(taskList.id, {
          showHidden: false,
          maxResults: 100
        });

        if (tasks.items) {
          tasks.items.forEach(task => {
            // If no date range is specified, include all tasks
            if (!startDate || !endDate) {
              allTasks.push({
                id: task.id,
                title: task.title,
                notes: task.notes || '',
                due: task.due || null,
                status: task.status,
                taskListId: taskList.id,
                taskListTitle: taskList.title
              });
            }
            // Otherwise, only include tasks with due dates within our range
            else if (task.due) {
              const taskDue = new Date(task.due);
              if (taskDue >= startDate && taskDue <= endDate) {
                allTasks.push({
                  id: task.id,
                  title: task.title,
                  notes: task.notes || '',
                  due: task.due,
                  status: task.status,
                  taskListId: taskList.id,
                  taskListTitle: taskList.title
                });
              }
            }
          });
        }
      } catch (e) {
        console.log(`Error getting tasks for list ${taskList.id}: ${e.message}`);
      }
    });

    // Add debug logging
    console.log('Tasks found:', allTasks.length);
    console.log('First task:', allTasks[0]);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      tasks: allTasks,
      message: allTasks.length === 0 ? "No tasks found" : null
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.log('Error in getTasks:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Creates a new task in the specified task list
 * @param {Object} params - Task parameters either as taskDetails object or direct parameters
 * @returns {Object} JSON response with created task
 */
function createTask(params) {
  try {
    // Extract task details from params, supporting both formats
    const taskDetails = {
      title: params.title,
      notes: params.notes || '',
      due: params.due,
      taskListId: params.taskListId,
      status: params.status || 'needsAction'
    };

    // Validate required fields
    if (!taskDetails.title || !taskDetails.taskListId) {
      throw new Error('Title and taskListId are required');
    }

    // Get actual taskListId if 'default' is specified
    let actualTaskListId = taskDetails.taskListId;
    if (taskDetails.taskListId === 'default') {
      const response = Tasks.Tasklists.list();
      if (!response.items || response.items.length === 0) {
        throw new Error('No task lists found');
      }
      actualTaskListId = response.items[0].id;  // Use first task list as default
    }

    // Create task resource
    const task = {
      title: taskDetails.title,
      notes: taskDetails.notes,
      status: taskDetails.status
    };

    // Add due date if provided
    if (taskDetails.due) {
      // Convert to RFC 3339 timestamp
      const dueDate = new Date(taskDetails.due);
      task.due = dueDate.toISOString();
    }

    // Insert the task
    const createdTask = Tasks.Tasks.insert(task, actualTaskListId);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      task: {
        id: createdTask.id,
        title: createdTask.title,
        notes: createdTask.notes,
        due: createdTask.due,
        status: createdTask.status,
        taskListId: actualTaskListId
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper function to get default date range (next 7 days)
 * @returns {Object} Object containing start and end dates
 */
function getDefaultDateRange() {
  const start = null;
  const end = null;
  
  return {
    startDateTime: start,
    endDateTime: end
  };
}
