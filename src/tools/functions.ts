const generateConfirmationCode = () => {
    const max = 999999
    const min = 100000

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { 
    generateConfirmationCode
}