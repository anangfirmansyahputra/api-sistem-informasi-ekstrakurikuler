const router = require('express').Router();
const Matpel = require('../model/Matpel');

router.post('/', async (req, res) => {
    const { name } = req.body;
    const matpelExist = await Matpel.findOne({ name: name });

    if (matpelExist) {
        return res.status(400).json({
            data: null,
            message: "Matpel already registered",
            success: false
        });
    }

    const newMatpel = new Matpel({
        name: name
    });

    try {
        const savedMatpel = await newMatpel.save();
        return res.status(200).json({
            success: true,
            message: "Create matpel success",
            data: savedMatpel
        });
    } catch (error) {
        return res.status(500).json({
            data: null,
            success: false,
            message: "Failed to create matpel"
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const allMatpel = await Matpel.find({});
        return res.status(200).json({
            data: allMatpel,
            success: true,
            message: "Get all matpel success"
        });
    } catch (error) {
        return res.status(500).json({
            data: null,
            success: false,
            message: "Failed to get matpel"
        });
    }
});

router.put('/:id', async (req, res) => {
    const idMatpel = req.params.id;
    const newName = req.body.name;

    try {
        const matpelExist = await Matpel.findById(idMatpel);

        if (!matpelExist) {
            return res.status(400).json({
                data: null,
                success: false,
                message: "Matpel doesn't exist"
            });
        }

        if (matpelExist.name === newName) {
            return res.status(200).json({
                data: matpelExist,
                success: true,
                message: "Update matpel success"
            });
        }

        const matpelName = await Matpel.findOne({ name: newName })

        if (matpelName) {
            return res.status(400).json({
                data: null,
                success: false,
                message: "Matpel alredy registered"
            });
        }

        matpelExist.name = newName;

        const updatedMatpel = await matpelExist.save();

        return res.status(200).json({
            data: updatedMatpel,
            success: true,
            message: "Update matpel success"
        });
    } catch (error) {
        return res.status(500).json({
            data: null,
            success: false,
            message: "Failed to update matpel"
        });
    }
});

router.delete('/:id', async (req, res) => {
    const idMatpel = req.params.id;

    try {
        const matpelExist = await Matpel.findById(idMatpel);

        if (!matpelExist) {
            return res.status(400).json({
                data: null,
                success: false,
                message: "Matpel doesn't exist"
            });
        }

        await matpelExist.deleteOne();

        return res.status(200).json({
            data: null,
            success: true,
            message: 'Delete matpel success'
        });
    } catch (error) {
        return res.status(500).json({
            data: null,
            success: false,
            message: "Failed to delete matpel"
        });
    }
});

router.get('/:id', async (req, res) => {
    const idMatpel = req.params.id;

    try {
        const matpel = await Matpel.findById(idMatpel);

        if (!matpel) {
            return res.status(404).json({
                data: null,
                success: false,
                message: "Matpel not found"
            });
        }

        return res.status(200).json({
            data: matpel,
            success: true,
            message: "Get matpel by ID success"
        });
    } catch (error) {
        return res.status(500).json({
            data: null,
            success: false,
            message: "Failed to get matpel by ID"
        });
    }
});


module.exports = router;
