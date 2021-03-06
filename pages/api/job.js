// API route for /new.
// Companies submit their new jobs through /new using /api/job

import prisma from 'lib/prisma'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
    // any request that’s not either POST or PUT is rejected.
    if (req.method !== 'POST' && req.method !== 'PUT') {
        return res.status(501).end()
    }

    // get the current session and we get the user object
    // from Prisma, or we end with a 401 status “Not Authorized” if the user
    // is not logged in
    const session = await getSession({ req })

    if (!session) return res.status(401).json({ message: 'Not logged in' })

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
    })
    
    if (!user) return res.status(401).json({ message: 'User not found' })

    // if the user is found, we do some validation and we make sure we have all the data we need:
    if (req.method === 'POST') {
        if (!req.body.title)
        return res
            .status(400)
            .json({ message: 'Required parameter title missing' })
        if (!req.body.description)
        return res
            .status(400)
            .json({ message: 'Required parameter description missing' })
        if (!req.body.location)
        return res
            .status(400)
            .json({ message: 'Required parameter location missing' })
        if (!req.body.salary)
        return res
            .status(400)
            .json({ message: 'Required parameter salary missing' })


        await prisma.job.create({
            data: {
                    title: req.body.title,
                    description: req.body.description,
                    location: req.body.location,
                    salary: req.body.salary,
                    author: {
                    connect: { id: user.id },
                    },
                },
            })
        res.status(200).end()
    }

    //  we fetch the job data from Prisma
    if (req.method === 'PUT') {
        const job = await prisma.job.findUnique({
            where: {
            id: parseInt(req.body.id),
            },
        })

        //check if the job author is equal 
        // to the current user id, which we get from the session.
        if (job.authorId !== user.id) {
            res.status(401).json({ message: 'Not authorized to edit' })
        }
        // update the published state based on the task that was sent,
        //  and we send the response back:
        if (req.body.task === 'publish') {
            await prisma.job.update({
            where: {
                id: parseInt(req.body.id),
            },
            data: {
                published: true,
            },
            })
        }

        if (req.body.task === 'unpublish') {
            await prisma.job.update({
            where: {
                id: parseInt(req.body.id),
            },
            data: {
                published: false,
            },
            })
        }
        res.status(200).end()
        return
    }

}