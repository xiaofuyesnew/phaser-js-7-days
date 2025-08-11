/**
 * Day 6 练习索引
 * 
 * 导出所有练习场景，方便在主程序中使用
 */

export { AudioSystemExercise } from './Exercise1_AudioSystem.js';
export { UIDesignExercise } from './Exercise2_UIDesign.js';
export { StateManagementExercise } from './Exercise3_StateManagement.js';
export { CompleteGameDemo } from './CompleteGameDemo.js';

/**
 * 练习信息配置
 */
export const exerciseConfig = {
    exercises: [
        {
            key: 'AudioSystemExercise',
            name: 'Exercise 1: Audio System',
            description: 'Learn audio loading, playback, and management',
            difficulty: 'Beginner',
            topics: ['Audio Loading', 'Volume Control', 'Sound Effects', 'Music Management']
        },
        {
            key: 'UIDesignExercise',
            name: 'Exercise 2: UI Design',
            description: 'Master UI creation, layout, and interaction design',
            difficulty: 'Intermediate',
            topics: ['UI Elements', 'Layout Systems', 'Animations', 'Responsive Design']
        },
        {
            key: 'StateManagementExercise',
            name: 'Exercise 3: State Management',
            description: 'Understand game state management and data persistence',
            difficulty: 'Advanced',
            topics: ['Game States', 'Data Persistence', 'Achievement System', 'Event Handling']
        },
        {
            key: 'CompleteGameDemo',
            name: 'Complete Game Demo',
            description: 'Experience a full game with all systems integrated',
            difficulty: 'Expert',
            topics: ['Full Integration', 'Game Loop', 'Player Control', 'Complete Experience']
        }
    ],
    
    learningPath: [
        'AudioSystemExercise',
        'UIDesignExercise', 
        'StateManagementExercise',
        'CompleteGameDemo'
    ],
    
    prerequisites: {
        'AudioSystemExercise': [],
        'UIDesignExercise': ['AudioSystemExercise'],
        'StateManagementExercise': ['AudioSystemExercise', 'UIDesignExercise'],
        'CompleteGameDemo': ['AudioSystemExercise', 'UIDesignExercise', 'StateManagementExercise']
    }
};