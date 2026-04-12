import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcryptjs';
import { RedisService } from '../redis/redis.service';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private userModel: Model<User>,
    private readonly redisService: RedisService,
    private readonly kafkaService: KafkaService,
  ) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new Error('Error fetching users: ' + error.message);
    }
  }

  async findById(userId: string): Promise<User | null> {
    try {
      return await this.userModel.findById(userId).exec();
    } catch (error) {
      throw new Error('Error finding user by ID: ' + error.message);
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      throw new Error('Error finding user by email: ' + error.message);
    }
  }

  async updatePassword(userId: string, newRawPassword: string): Promise<void> {
    const rateLimitKey = `password_reset_rate_limit:${userId}`;
    const ttl = 3600;

    await this.redisService.rateLimitOrThrow(
      rateLimitKey,
      ttl,
      'Password can only be changed once per hour',
    );
    try {
      const user = await this.userModel.findById(userId).select('password');

      if (!user) {
        throw new Error('User not found');
      }

      const isSamePassword = await bcrypt.compare(
        newRawPassword,
        user.password,
      );
      if (isSamePassword) {
        throw new Error('New password cannot be the same as the old password');
      }

      const hashedPassword = await bcrypt.hash(newRawPassword, 10);

      await this.userModel.findByIdAndUpdate(userId, {
        password: hashedPassword,
      });
    } catch (error) {
      throw new Error('Error updating password: ' + error.message);
    }
  }

  async updateProfileImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<User> {
    const imageUrl = `uploads/${file.filename}`;

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { returnDocument: 'after' },
    );

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateBio(userId: string, bio: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { bio },
      { returnDocument: 'after' },
    );

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getTips(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId).select('tips').exec();
    if (!user) throw new NotFoundException('User not found');
    return (user as any).tips || '';
  }

  async updateTips(userId: string, tips: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { tips },
      { returnDocument: 'after' },
    );

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findInfluencers(): Promise<User[]> {
    return this.userModel.find({ role: 'influencer' }).exec();
  }

  async getMatchedInfluencers(brandId: string): Promise<any[]> {
    const brand = await this.userModel.findById(brandId).exec();
    if (!brand) throw new NotFoundException('Brand not found');

    const brandInterests = (brand as any).interests || [];
    const brandBio = (brand as any).bio?.toLowerCase() || '';
    const acceptedIds = ((brand as any).acceptedInfluencers || []).map((id: Types.ObjectId) => id.toString());
    const rejectedIds = ((brand as any).rejectedInfluencers || []).map((id: Types.ObjectId) => id.toString());

    const influencers = await this.userModel.find({ role: 'influencer' }).exec();

    const matchedInfluencers = influencers.map((inf) => {
      const influencer = inf as any;
      const interests = influencer.interests || [];
      const bio = influencer.bio?.toLowerCase() || '';
      const category = influencer.category?.toLowerCase() || '';

      let interestMatchCount = 0;
      let bioWordMatchCount = 0;

      if (brandInterests.length > 0 && interests.length > 0) {
        const commonInterests = brandInterests.filter((i: string) =>
          interests.map((x: string) => x.toLowerCase()).includes(i.toLowerCase())
        );
        interestMatchCount = commonInterests.length;
      }

      if (brandBio && bio) {
        const brandWords = brandBio.split(/\s+/).filter(w => w.length > 3);
        bioWordMatchCount = brandWords.filter((word: string) => bio.includes(word)).length;
      }

      const interestScore = brandInterests.length > 0 
        ? (interestMatchCount / Math.max(brandInterests.length, interests.length)) * 50 
        : 0;
      const bioScore = brandBio.length > 0 
        ? (bioWordMatchCount / Math.min(brandBio.split(/\s+/).length, 10)) * 50 
        : 0;
      const categoryScore = category && brandBio.includes(category) ? 20 : 0;

      const totalScore = Math.min(interestScore + bioScore + categoryScore, 100);

      return {
        id: influencer._id,
        username: influencer.username,
        category: influencer.category,
        bio: influencer.bio,
        profileImage: influencer.profileImage,
        interests: interests,
        matchPercentage: Math.round(totalScore),
      };
    });

    return matchedInfluencers
      .filter(inf => 
        inf.matchPercentage > 0 && 
        !acceptedIds.includes(inf.id.toString()) &&
        !rejectedIds.includes(inf.id.toString())
      )
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  async updateInterests(userId: string, interests: string[]): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { interests },
      { returnDocument: 'after' },
    );

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getMatchedBrands(influencerId: string): Promise<any[]> {
    const influencer = await this.userModel.findById(influencerId).exec();
    if (!influencer) throw new NotFoundException('Influencer not found');

    const influencerInterests = (influencer as any).interests || [];
    const influencerBio = (influencer as any).bio?.toLowerCase() || '';
    const influencerCategory = (influencer as any).category?.toLowerCase() || '';

    const brands = await this.userModel.find({ role: 'brand' }).exec();

    const matchedBrands = brands.map((brand) => {
      const brandData = brand as any;
      const brandInterests = brandData.interests || [];
      const brandBio = brandData.bio?.toLowerCase() || '';

      let interestMatchCount = 0;
      let bioWordMatchCount = 0;

      if (brandInterests.length > 0 && influencerInterests.length > 0) {
        const commonInterests = influencerInterests.filter((i: string) =>
          brandInterests.map((x: string) => x.toLowerCase()).includes(i.toLowerCase())
        );
        interestMatchCount = commonInterests.length;
      }

      if (brandBio && influencerBio) {
        const brandWords = brandBio.split(/\s+/).filter(w => w.length > 3);
        bioWordMatchCount = brandWords.filter((word: string) => influencerBio.includes(word)).length;
      }

      const interestScore = brandInterests.length > 0 
        ? (interestMatchCount / Math.max(brandInterests.length, influencerInterests.length)) * 50 
        : 0;
      const bioScore = brandBio.length > 0 
        ? (bioWordMatchCount / Math.min(brandBio.split(/\s+/).length, 10)) * 50 
        : 0;
      const categoryScore = influencerCategory && brandBio.includes(influencerCategory) ? 20 : 0;

      const totalScore = Math.min(interestScore + bioScore + categoryScore, 100);

      return {
        id: brandData._id,
        username: brandData.username,
        bio: brandData.bio,
        profileImage: brandData.profileImage,
        interests: brandInterests,
        matchPercentage: Math.round(totalScore),
      };
    });

    return matchedBrands
      .filter(brand => brand.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  async acceptInfluencer(brandId: string, influencerId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(brandId, {
      $addToSet: { acceptedInfluencers: new Types.ObjectId(influencerId) },
      $pull: { rejectedInfluencers: new Types.ObjectId(influencerId) },
    });

    await this.userModel.findByIdAndUpdate(influencerId, {
      status: 'accepted',
      brandId: new Types.ObjectId(brandId),
    });
    
    try {
      const [influencer, brand] = await Promise.all([
        this.userModel.findById(influencerId),
        this.userModel.findById(brandId),
      ]);
      const kafkaPayload = {
        influencerId,
        brandId,
        brandName: brand?.username || 'Brand',
        username: influencer?.username || 'Influencer',
        timestamp: new Date().toISOString(),
      };
      await this.kafkaService.sendMessage('brand-actions', 'influencer.accepted', kafkaPayload);
    } catch (error) {
      // Silent fail for Kafka
    }
  }

  async rejectInfluencer(brandId: string, influencerId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(brandId, {
      $addToSet: { rejectedInfluencers: new Types.ObjectId(influencerId) },
      $pull: { acceptedInfluencers: new Types.ObjectId(influencerId) },
    });

    try {
      const influencer = await this.userModel.findById(influencerId);
      await this.kafkaService.sendMessage('brand-actions', 'influencer.rejected', {
        influencerId,
        brandId,
        username: influencer?.username || 'Influencer',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Silent fail for Kafka
    }
  }

  async createCampaignInviteNotification(brandId: string, influencerId: string, campaignId?: string): Promise<void> {
    // This would integrate with notification service to send notification to influencer
    // The notification will be handled via Kafka in the actual implementation
  }

  async acceptBrandInvitation(influencerId: string, brandId: string): Promise<void> {
    console.log('[acceptBrandInvitation] Saving - influencerId:', influencerId, 'brandId:', brandId);
    
    await this.userModel.findByIdAndUpdate(influencerId, {
      $addToSet: { acceptedBrands: new Types.ObjectId(brandId) },
    });
    console.log('[acceptBrandInvitation] Added to acceptedBrands array');

    await this.userModel.findByIdAndUpdate(brandId, {
      $addToSet: { acceptedInfluencers: new Types.ObjectId(influencerId) },
      $pull: { rejectedInfluencers: new Types.ObjectId(influencerId) },
    });
    console.log('[acceptBrandInvitation] Added to brand acceptedInfluencers');

    await this.userModel.findByIdAndUpdate(influencerId, {
      status: 'accepted',
      brandId: new Types.ObjectId(brandId),
    });
    console.log('[acceptBrandInvitation] Updated influencer status');

    try {
      const [influencer, brand] = await Promise.all([
        this.userModel.findById(influencerId),
        this.userModel.findById(brandId),
      ]);
      await this.kafkaService.sendMessage('brand-actions', 'influencer.accepted', {
        influencerId,
        brandId,
        brandName: brand?.username || 'Brand',
        username: influencer?.username || 'Influencer',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Silent fail for Kafka
    }
  }

  async getAcceptedInfluencers(brandId: string): Promise<User[]> {
    return this.userModel.find({ 
      role: 'influencer', 
      status: 'accepted',
      brandId 
    }).exec();
  }

  async getAcceptedBrands(influencerId: string): Promise<any[]> {
    console.log('[getAcceptedBrands] Processing influencerId:', influencerId);
    
    const influencer = await this.userModel.findById(influencerId);
    if (!influencer) {
      console.log('[getAcceptedBrands] Influencer not found');
      return [];
    }
    
    const influencerData = influencer as any;
    console.log('[getAcceptedBrands] Influencer status:', influencerData.status);
    console.log('[getAcceptedBrands] Influencer acceptedBrands:', influencerData.acceptedBrands);
    
    const acceptedBrandIds = (influencerData.acceptedBrands || []).map((id: Types.ObjectId) => id.toString());
    console.log('[getAcceptedBrands] acceptedBrandIds:', acceptedBrandIds);

    if (acceptedBrandIds.length > 0) {
      const brands = await this.userModel.find({ 
        role: 'brand',
        _id: { $in: acceptedBrandIds.map(id => new Types.ObjectId(id)) }
      }).exec();

      const result = brands.map((brand: any) => ({
        id: brand._id,
        username: brand.username,
        bio: brand.bio,
        profileImage: brand.profileImage,
      }));
      console.log('[getAcceptedBrands] Returning from acceptedBrands field:', result);
      return result;
    }

    console.log('[getAcceptedBrands] Checking brands acceptedInfluencers array...');
    const allBrands = await this.userModel.find({ role: 'brand' }).exec();
    const acceptedBrands = [];
    
    for (const brand of allBrands) {
      const brandData = brand as any;
      const acceptedInfluencers = brandData.acceptedInfluencers || [];
      console.log('[getAcceptedBrands] Brand:', brandData.username, 'acceptedInfluencers:', acceptedInfluencers.map((i: any) => i.toString()));
      if (acceptedInfluencers.some((id: Types.ObjectId) => id.toString() === influencerId)) {
        acceptedBrands.push({
          id: brandData._id,
          username: brandData.username,
          bio: brandData.bio,
          profileImage: brandData.profileImage,
        });
      }
    }
    
    console.log('[getAcceptedBrands] Final result:', acceptedBrands);
    return acceptedBrands;
  }

  async getRejectedInfluencers(brandId: string): Promise<User[]> {
    return this.userModel.find({ 
      role: 'influencer', 
      status: 'rejected',
      brandId 
    }).exec();
  }
}
