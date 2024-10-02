const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A tour must have a name"],
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
        },
        duration: {
            type: Number,
            require: [true, "A tour nust have a duration"],
        },
        maxGroupSize: {
            type: Number,
            required: [true, "A tour must hava a size"],
        },
        difficulty: {
            type: String,
            required: [true, "A tour must have a difficulty"],
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
        },
        ratingsQuatity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, "A tour must have a price"],
        },
        priceDiscount: Number,
        summary: {
            type: String,
            trim: true,
            required: [true, "A tour must have a summary"],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, "A tour must have a cover image"],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
            select: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Virtual Fields
tourSchema.virtual("durationWeeks").get(function () {
    return this.duration / 7;
});

// DOCUMENT MEDDLEWARE / HOOK :
// runs before Model.prototype.save() and Model.create()
tourSchema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// runs after Model.prototype.save() and Model.create()
tourSchema.post("save", function (doc, next) {
    // console.log(doc);
    next();
});

// QUERY MIDDLEWARE / HOOK
// runs before Model.find() but not for findOne()
// Using regX /^find/ to work it for
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

// runs after Model.find() but not for findOne()
tourSchema.post(/^find/, function (docs, next) {
    // console.log(docs);
    // console.log(`Query took : ${Date.now() - this.start} milliseconds.`);
    next();
});

// AGGREGATION MIDDLEWARE

const Tour = mongoose.model("Tour", tourSchema);

module.exports = { Tour };
