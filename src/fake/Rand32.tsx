
// Copyright 2021 Alan Tracey Wootton
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import * as crypto from 'crypto'

/**
 * @class
 * @classdesc Concrete sfc32 implementation.
 * borrowwd from https://github.com/michaeldzjap/rand-seed/blob/develop/src/Algorithms/Sfc32.ts
 * because their version was giving runtime errors
 */
export default class Rand32 {
    /**
     * Seed parameters.
     *
     * @var {number}
     */
    private a: number;
    private b: number;
    private c: number;
    private d: number;

    /**
     * Create a new sfc32 instance.
     *
     * @param {string} str
     */
    public constructor(str: string) {
        // super();

        // Create the seed for the random number algorithm
        var i = 0
        const hash = crypto.createHash('sha256')
        hash.write(str)
        hash.end()
        var hbytes = hash.digest()
        const seed = () => {
            var x = hbytes[i++]
            x = x << 8
            x += hbytes[i++]
            x = x << 8
            x += hbytes[i++]
            x = x << 8
            x += hbytes[i++]
            return x
        }

        this.a = seed();
        this.b = seed();
        this.c = seed();
        this.d = seed();
    }

    /**
     * Generate a random number using the sfc32 algorithm.
     *
     * @returns {number}
     */
    public next(): number {
        this.a >>>= 0;
        this.b >>>= 0;
        this.c >>>= 0;
        this.d >>>= 0;

        let t = (this.a + this.b) | 0;

        this.a = this.b ^ (this.b >>> 9);
        this.b = (this.c + (this.c << 3)) | 0;
        this.c = (this.c << 21) | (this.c >>> 11);
        this.d = (this.d + 1) | 0;
        t = (t + this.d) | 0;
        this.c = (this.c + t) | 0;

        return (t >>> 0) / 4294967296;
    }
}
