/**
 * Media Service
 */

window.App = window.App || {};

window.App.getExerciseMedia = async function (exerciseName) {
    // Simulate API Latency
    await new Promise(r => setTimeout(r, 500));

    // Mock logic: generate deterministic colors or placeholders based on name

    // In the future, this could actually fetch from an external source
    return {
        // Using a reliable placeholder service for visual demo
        poster: `https://placehold.co/600x400/1e293b/FFF?text=${encodeURIComponent(exerciseName)}`,
        videoUrl: null // No video for now
    };
};
