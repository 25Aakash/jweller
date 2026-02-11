export const getGreeting = (): { text: string; emoji: string } => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return { text: 'Good Morning', emoji: '🌅' };
    } else if (hour >= 12 && hour < 17) {
        return { text: 'Good Afternoon', emoji: '☀️' };
    } else if (hour >= 17 && hour < 21) {
        return { text: 'Good Evening', emoji: '🌆' };
    } else {
        return { text: 'Good Night', emoji: '🌙' };
    }
};

export const getMotivationalMessage = (): string => {
    const messages = [
        'Your financial future starts today!',
        'Invest wisely, grow steadily.',
        'Every gram counts towards your goals.',
        'Building wealth, one step at a time.',
        'Smart investments for a brighter tomorrow.',
    ];

    return messages[Math.floor(Math.random() * messages.length)];
};
