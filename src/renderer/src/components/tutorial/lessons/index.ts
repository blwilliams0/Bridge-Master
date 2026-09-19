import Overview from './01Overview'
import CardRanking from './02CardRanking'
import HandEvaluation from './03HandEvaluation'
import AuctionBasics from './04AuctionBasics'
import OpeningBids from './05OpeningBids'
import ResponsesStayman from './06ResponsesStayman'
import NotrumpVsSuit from './07NotrumpVsSuit'
import PlayingTheHand from './08PlayingTheHand'
import DefenseBasics from './09DefenseBasics'
import Scoring from './10Scoring'
import GuidedExample from './11GuidedExample'

export interface Lesson {
  id: string
  title: string
  summary: string
  Component: () => React.JSX.Element
}

export const LESSONS: Lesson[] = [
  { id: 'overview', title: 'Overview', summary: 'Partnerships, tricks, and the shape of a hand.', Component: Overview },
  { id: 'card-ranking', title: 'Card Ranking & Suits', summary: 'Rank order and what a trump suit does.', Component: CardRanking },
  { id: 'hand-evaluation', title: 'Hand Evaluation', summary: 'Counting points -- with a quiz.', Component: HandEvaluation },
  { id: 'auction-basics', title: 'Auction Basics', summary: 'Bidding order, levels, and strains.', Component: AuctionBasics },
  { id: 'opening-bids', title: 'Opening Bids', summary: 'What to open, and why.', Component: OpeningBids },
  { id: 'responses-stayman', title: 'Responses & Stayman', summary: "Replying to partner's opening.", Component: ResponsesStayman },
  { id: 'notrump-vs-suit', title: 'Notrump vs. Suit Contracts', summary: 'Choosing the right strain.', Component: NotrumpVsSuit },
  { id: 'playing-the-hand', title: 'Playing the Hand', summary: 'Declarer, dummy, following suit, ruffing.', Component: PlayingTheHand },
  { id: 'defense-basics', title: 'Defense Basics', summary: 'Opening leads and defensive signals.', Component: DefenseBasics },
  { id: 'scoring', title: 'Scoring', summary: 'How points, bonuses, and penalties work.', Component: Scoring },
  { id: 'guided-example', title: 'Guided Example Hand', summary: 'One full deal, start to finish.', Component: GuidedExample }
]
