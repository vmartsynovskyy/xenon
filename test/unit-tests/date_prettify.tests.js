describe('Date Prettification function', function() {
    it("prettifies a javascript date object of 2015/11/5 to Thursday November 5th, 2015", function() {
        var testDateInitial = new Date(2015, 10, 5);
        expect(testDateInitial.getPrettified()).toBe("Thursday November 5th, 2015");
    });
    it("prettifies a javascript date object of 1992/5/4 to Saturday May 23rd, 1992", function() {
        var testDateInitial = new Date(1992, 4, 23);
        expect(testDateInitial.getPrettified()).toBe("Saturday May 23rd, 1992");
    });
});