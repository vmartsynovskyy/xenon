describe('Date Incrementation function', function() {
    it("increments a date by one day on a normal day", function() {
        var testDateInitial = new Date(2015, 11, 5);
        var onePastInitial = new Date(2015, 11, 6);
        expect(testDateInitial.incrementDate(1).getTime()).toBe(onePastInitial.getTime());
    });
    it("increments a date by one day through daylight savings time", function() {
        var testDateInitial = new Date(2015, 11, 1);
        var onePastInitial = new Date(2015, 11, 2);
        expect(testDateInitial.incrementDate(1).getTime()).toBe(onePastInitial.getTime());
    });
    it("increments a date by three days on a normal day", function() {
        var testDateInitial = new Date(2015, 11, 8);
        var onePastInitial = new Date(2015, 11, 11);
        expect(testDateInitial.incrementDate(3).getTime()).toBe(onePastInitial.getTime());
    });
});